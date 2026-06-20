import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, finalize, of, tap } from 'rxjs';

import { ApiClientError } from '../../../../core/http/models/api-error.model';
import { PaymentStatusBadgeComponent } from '../../components/payment-status-badge/payment-status-badge.component';
import { PaymentSummaryCardComponent } from '../../components/payment-summary-card/payment-summary-card.component';
import { mapPaymentApiError } from '../../data-access/payments-error.mapper';
import {
  PaymentIntentStatus,
  PaymentStatusResult,
} from '../../data-access/payments.models';
import { PaymentsApi } from '../../data-access/payments.api';
import { PaymentRedirectService } from '../../services/payment-redirect.service';
import {
  PaymentPollingEvent,
  PaymentStatusPollerService,
  PROVIDER_RETURN_MAX_ATTEMPTS,
  isPaypalPayerActionRequired,
} from '../../services/payment-status-poller.service';

const TERMINAL_PAYMENT_INTENT_STATUSES: PaymentIntentStatus[] = [
  'paid',
  'succeeded',
  'completed',
  'failed',
  'denied',
  'cancelled',
  'expired',
];

const NON_TERMINAL_PAYMENT_INTENT_STATUSES: PaymentIntentStatus[] = [
  'pending',
  'checkout_created',
  'processing',
  'pending_capture',
];

const RECENT_POLLING_WINDOW_MS = 60_000;
const POLLING_STORAGE_KEY_PREFIX = 'payment-provider-return-polled:';

@Component({
  selector: 'app-payment-result-page',
  imports: [RouterLink, PaymentStatusBadgeComponent, PaymentSummaryCardComponent],
  templateUrl: './payment-result-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentResultPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(PaymentsApi);
  private readonly redirectService = inject(PaymentRedirectService);
  private readonly poller = inject(PaymentStatusPollerService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly result = signal<PaymentStatusResult | null>(null);
  readonly loading = signal(false);
  readonly polling = signal(false);
  readonly attempts = signal(0);
  readonly errorMessage = signal<string | null>(null);
  readonly noticeMessage = signal<string | null>(null);
  readonly paymentIntentId = signal<string | null>(null);
  readonly providerReference = signal<string | null>(null);
  readonly providerLabel = signal('El proveedor');
  readonly maxPollingAttempts = PROVIDER_RETURN_MAX_ATTEMPTS;

  readonly status = computed<PaymentIntentStatus | null>(
    () => this.result()?.payment_intent.status ?? null,
  );
  readonly isTerminal = computed(() => {
    const status = this.status();
    return !!status && TERMINAL_PAYMENT_INTENT_STATUSES.includes(status);
  });
  readonly isPendingConfirmation = computed(() => {
    const status = this.status();
    return !!status && NON_TERMINAL_PAYMENT_INTENT_STATUSES.includes(status);
  });
  readonly title = computed(() => this.titleForStatus(this.status()));
  readonly message = computed(() => this.messageForStatus(this.status()));
  readonly statusClasses = computed(() => this.classesForStatus(this.status()));
  readonly canRetry = computed(() => {
    const paymentIntent = this.result()?.payment_intent;
    if (!paymentIntent) return false;

    return paymentIntent.can_retry ??
      (
        paymentIntent.status === 'failed' ||
        paymentIntent.status === 'rejected' ||
        paymentIntent.status === 'denied' ||
        paymentIntent.status === 'cancelled' ||
        paymentIntent.status === 'expired'
      );
  });
  readonly canContinueCheckout = computed(() => {
    const paymentIntent = this.result()?.payment_intent;
    if (!paymentIntent) return false;

    return (
      paymentIntent.can_continue_checkout ??
      (paymentIntent.status === 'checkout_created' && !!paymentIntent.checkout_url)
    );
  });
  readonly canRefreshStatus = computed(() => {
    const paymentIntent = this.result()?.payment_intent;
    if (!paymentIntent) return !!this.paymentIntentId();

    return paymentIntent.can_refresh_status ?? this.isPendingConfirmation();
  });
  readonly bookingLink = computed(() => {
    const paymentIntent = this.result()?.payment_intent;
    if (!paymentIntent) return null;

    return (paymentIntent.can_view_booking ?? !!paymentIntent.booking_id) && paymentIntent.booking_id
      ? `/my-bookings/${paymentIntent.booking_id}`
      : null;
  });
  readonly retryLink = computed(() => {
    const paymentIntent = this.result()?.payment_intent;
    if (!paymentIntent) return '/services';

    return paymentIntent.payable_type === 'booking'
      ? `/my-bookings/${paymentIntent.payable_id}`
      : '/services';
  });

  ngOnInit(): void {
    const queryParams = this.route.snapshot.queryParamMap;
    const paymentIntentId =
      queryParams.get('payment_intent_id') ?? queryParams.get('paymentIntentId');
    const providerReference =
      queryParams.get('token') ??
      queryParams.get('preference_id') ??
      queryParams.get('payment_id') ??
      queryParams.get('collection_id') ??
      queryParams.get('external_reference') ??
      queryParams.get('PayerID');

    this.paymentIntentId.set(paymentIntentId);
    this.providerReference.set(providerReference);
    this.providerLabel.set(this.resolveProviderLabel());

    if (!paymentIntentId) {
      if (providerReference) {
        this.noticeMessage.set(
          'Recibimos una referencia del proveedor, pero falta el identificador interno del pago. Volve a la reserva o al paquete para revisar su estado.',
        );
      } else {
        this.errorMessage.set('No pudimos identificar el pago para consultar su estado.');
      }
      return;
    }

    if (!this.cameFromPaymentProvider()) {
      this.fetchStatusOnce(paymentIntentId);
      return;
    }

    if (this.hasRecentlyPolled(paymentIntentId)) {
      this.setPendingConfirmationNotice();
      this.syncProviderStatus(paymentIntentId);
      return;
    }

    this.syncProviderStatus(paymentIntentId);
  }

  refresh(): void {
    const paymentIntentId = this.paymentIntentId();
    if (!paymentIntentId || this.loading() || this.polling()) return;

    this.errorMessage.set(null);
    this.noticeMessage.set(null);
    this.syncProviderStatus(paymentIntentId);
  }
  private syncProviderStatus(paymentIntentId: string): void {
    this.loading.set(true);

    this.api
      .syncProviderStatus(paymentIntentId, this.providerReturnPayload())
      .pipe(
        tap((result) => {
          this.applyResult(result);

          if (this.isPendingConfirmation()) {
            this.setPendingConfirmationNotice();
          }
        }),
        catchError((error: unknown) => {
          this.applyRequestError(error, 'No pudimos sincronizar el estado del pago con el proveedor.');
          return of(null);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }
  private providerReturnPayload(): Record<string, string> {
    const queryParams = this.route.snapshot.queryParamMap;

    const payload: Record<string, string> = {};

    const paymentId = queryParams.get('payment_id') ?? queryParams.get('collection_id');
    const preferenceId = queryParams.get('preference_id');
    const externalReference = queryParams.get('external_reference');
    const status = queryParams.get('status') ?? queryParams.get('collection_status');
    const merchantOrderId = queryParams.get('merchant_order_id');

    if (paymentId) payload['payment_id'] = paymentId;
    if (preferenceId) payload['preference_id'] = preferenceId;
    if (externalReference) payload['external_reference'] = externalReference;
    if (status) payload['status'] = status;
    if (merchantOrderId) payload['merchant_order_id'] = merchantOrderId;

    return payload;
  }
  continueCheckout(): void {
    const paymentIntent = this.result()?.payment_intent;
    if (!paymentIntent || !this.canContinueCheckout() || this.loading() || this.polling()) return;

    this.errorMessage.set(null);
    this.noticeMessage.set(null);

    if (paymentIntent.checkout_url) {
      this.redirectService.redirectToCheckout(paymentIntent.checkout_url);
      return;
    }

    this.loading.set(true);
    this.api
      .createCheckout(paymentIntent.id, { provider: paymentIntent.provider })
      .pipe(
        tap((updatedIntent) => {
          this.applyResult({
            payment_intent: updatedIntent,
            payment: this.result()?.payment ?? null,
          });

          if (updatedIntent.checkout_url) {
            this.redirectService.redirectToCheckout(updatedIntent.checkout_url);
            return;
          }

          this.noticeMessage.set('El checkout todavia no esta disponible. Intenta actualizar el estado.');
        }),
        catchError((error: unknown) => {
          this.applyRequestError(error, 'No pudimos continuar el pago.');
          return of(null);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private fetchStatusOnce(paymentIntentId: string): void {
    this.loading.set(true);

    this.poller
      .fetchOnce(paymentIntentId)
      .pipe(
        tap((result) => {
          this.applyResult(result);

          if (isPaypalPayerActionRequired(result)) {
            this.setPendingConfirmationNotice();
          }
        }),
        catchError((error: unknown) => {
          this.applyRequestError(error, 'No pudimos actualizar el estado del pago.');
          return of(null);
        }),
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private startProviderReturnPolling(paymentIntentId: string): void {
    if (this.polling()) return;

    this.loading.set(true);
    this.polling.set(true);
    this.attempts.set(0);
    this.errorMessage.set(null);
    this.noticeMessage.set(
      'Estamos esperando la confirmacion automatica del proveedor. Esto puede demorar unos segundos.',
    );

    this.poller
      .pollProviderReturn(paymentIntentId)
      .pipe(
        tap((event) => this.applyPollingEvent(event)),
        finalize(() => {
          this.loading.set(false);
          this.polling.set(false);
          this.markPollingFinished(paymentIntentId);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private applyPollingEvent(event: PaymentPollingEvent): void {
    this.attempts.set(event.attempt);

    if (event.type === 'error') {
      this.applyRequestError(event.error, 'No pudimos consultar el estado del pago.');
      return;
    }

    this.applyResult(event.result);

    if (event.reason === 'max_attempts' || event.reason === 'max_duration') {
      this.setPollingTimeoutNotice();
    }
  }

  private applyResult(result: PaymentStatusResult): void {
    this.result.set(result);
    this.errorMessage.set(null);

    if (TERMINAL_PAYMENT_INTENT_STATUSES.includes(result.payment_intent.status)) {
      this.noticeMessage.set(null);
      this.redirectService.clear();
    }
  }

  private setPendingConfirmationNotice(): void {
    this.noticeMessage.set(
      'El proveedor puede demorar unos segundos mas en notificar la operacion. Podes actualizar el estado manualmente.',
    );
  }

  private setPollingTimeoutNotice(): void {
    this.noticeMessage.set('El pago sigue siendo procesado. Te avisaremos cuando se confirme.');
  }

  private applyRequestError(error: unknown, fallback: string): void {
    if (error instanceof ApiClientError && error.status === 429) {
      this.noticeMessage.set(
        'Se realizaron demasiadas consultas. Espera unos segundos y actualiza manualmente.',
      );
      this.errorMessage.set(null);
      return;
    }

    this.errorMessage.set(mapPaymentApiError(error, fallback));
  }

  private hasRecentlyPolled(paymentIntentId: string): boolean {
    const storage = this.sessionStorage();
    if (!storage) return false;

    try {
      const storedAt = Number(storage.getItem(this.pollingStorageKey(paymentIntentId)));
      return Number.isFinite(storedAt) && Date.now() - storedAt < RECENT_POLLING_WINDOW_MS;
    } catch {
      return false;
    }
  }

  private markPollingFinished(paymentIntentId: string): void {
    const storage = this.sessionStorage();
    if (!storage) return;

    try {
      storage.setItem(this.pollingStorageKey(paymentIntentId), String(Date.now()));
    } catch {
      // Storage can be unavailable in privacy-restricted browser contexts.
    }
  }

  private sessionStorage(): Storage | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return this.document.defaultView?.sessionStorage ?? null;
  }

  private pollingStorageKey(paymentIntentId: string): string {
    return `${POLLING_STORAGE_KEY_PREFIX}${paymentIntentId}`;
  }

  private cameFromPaymentProvider(): boolean {
    const queryParams = this.route.snapshot.queryParamMap;

    return (
      queryParams.has('token') ||
      queryParams.has('PayerID') ||
      queryParams.has('payment_id') ||
      queryParams.has('collection_id') ||
      queryParams.has('preference_id') ||
      queryParams.has('external_reference')
    );
  }

  private resolveProviderLabel(): string {
    const queryParams = this.route.snapshot.queryParamMap;

    if (queryParams.has('token') || queryParams.has('PayerID')) {
      return 'PayPal';
    }

    if (
      queryParams.has('payment_id') ||
      queryParams.has('collection_id') ||
      queryParams.has('preference_id')
    ) {
      return 'MercadoPago';
    }

    return 'El proveedor';
  }

  private titleForStatus(status: PaymentIntentStatus | null): string {
    switch (status) {
      case 'succeeded':
      case 'paid':
      case 'completed':
        return 'Pago confirmado';
      case 'rejected':
      case 'denied':
        return 'Pago rechazado';
      case 'failed':
        return 'Pago fallido';
      case 'cancelled':
        return 'Pago cancelado';
      case 'expired':
        return 'Intento expirado';
      case 'processing':
      case 'pending_capture':
        return 'Pago en proceso';
      case 'pending':
      case 'checkout_created':
        return this.polling()
          ? 'Estamos confirmando tu pago'
          : 'Pago pendiente de confirmación';
      default:
        return this.polling() ? 'Estamos confirmando tu pago' : 'Resultado del pago';
    }
  }

  private messageForStatus(status: PaymentIntentStatus | null): string {
    switch (status) {
      case 'succeeded':
      case 'paid':
      case 'completed':
        return 'El proveedor notifico la operacion y ProConnect ya confirmo el pago.';
      case 'rejected':
      case 'denied':
        return 'El proveedor rechazó este pago. Podés intentar nuevamente con otro medio de pago.';
      case 'failed':
        return 'No se pudo completar el pago. Podés intentar nuevamente si la reserva sigue disponible.';
      case 'cancelled':
        return 'El pago fue cancelado.';
      case 'expired':
        return 'Este intento de pago expiró. Podés crear uno nuevo si la reserva sigue disponible.';
      case 'processing':
      case 'pending_capture':
        return 'El proveedor todavía está procesando el pago.';
      case 'pending':
      case 'checkout_created':
        return this.polling()
          ? `${this.providerLabel()} ya te redirigio a ProConnect. Estamos esperando la confirmacion automatica del proveedor.`
          : 'El proveedor puede demorar unos segundos mas en notificar la operacion. Podes actualizar el estado manualmente.';
      default:
        return this.polling()
          ? `${this.providerLabel()} ya te redirigio a ProConnect. Estamos esperando la confirmacion automatica del proveedor.`
          : 'Consulta el estado real del pago antes de continuar.';
    }
  }

  private classesForStatus(status: PaymentIntentStatus | null): string {
    switch (status) {
      case 'succeeded':
      case 'paid':
      case 'completed':
        return 'border-emerald-200 bg-emerald-50 text-emerald-950';
      case 'rejected':
      case 'denied':
      case 'failed':
        return 'border-rose-200 bg-rose-50 text-rose-950';
      case 'cancelled':
      case 'expired':
        return 'border-slate-300 bg-slate-100 text-slate-950';
      default:
        return 'border-amber-200 bg-amber-50 text-amber-950';
    }
  }
}
