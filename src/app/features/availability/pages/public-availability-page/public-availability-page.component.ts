import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { TokenStorageService } from '../../../../core/auth/services/token-storage.service';
import { ApiClientError } from '../../../../core/http/models/api-error.model';
import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppButtonComponent } from '../../../../shared/ui/button/button.component';
import { AppCardComponent } from '../../../../shared/ui/card/card.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { AppLoadingSpinnerComponent } from '../../../../shared/ui/loading-spinner/loading-spinner.component';
import { formatTimeRange, toDateInputValue } from '../../../../shared/utils/date.util';
import { ServicesApi } from '../../../services/data-access/services.api';
import { Service } from '../../../services/models/service.models';
import { AvailabilityApi } from '../../data-access/availability.api';
import { AvailabilitySlot } from '../../models/availability.models';

@Component({
  selector: 'app-public-availability-page',
  imports: [
    ReactiveFormsModule,
    AppAlertComponent,
    AppButtonComponent,
    AppCardComponent,
    AppEmptyStateComponent,
    AppLoadingSpinnerComponent,
  ],
  templateUrl: './public-availability-page.component.html',
  styleUrl: './public-availability-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicAvailabilityPageComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly availabilityApi = inject(AvailabilityApi);
  private readonly servicesApi = inject(ServicesApi);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly slots = signal<AvailabilitySlot[]>([]);
  readonly service = signal<Service | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    date: [toDateInputValue(new Date()), [Validators.required]],
  });

  ngOnInit(): void {
    this.tryLoadService();
    this.loadSlots();
  }

  loadSlots(): void {
    const serviceId = this.route.snapshot.paramMap.get('id');
    if (!serviceId || this.form.invalid) {
      this.errorMessage.set('Servicio no encontrado.');
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.availabilityApi
      .slots(serviceId, this.form.getRawValue().date)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.slots.set(response.slots),
        error: (error: unknown) => this.errorMessage.set(this.errorFrom(error)),
      });
  }

  slotLabel(slot: AvailabilitySlot): string {
    return formatTimeRange(slot.starts_at, slot.ends_at);
  }

  private tryLoadService(): void {
    const serviceId = this.route.snapshot.paramMap.get('id');
    if (!serviceId || !this.tokenStorage.hasSession()) return;

    this.servicesApi
      .show(serviceId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => this.service.set(response.service),
        error: () => undefined,
      });
  }

  private errorFrom(error: unknown): string {
    if (error instanceof ApiClientError) return error.message;
    return 'No pudimos consultar los horarios disponibles.';
  }
}
