import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnChanges,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { Booking } from '../../../bookings/models/booking.models';
import { VideoSessionsApi } from '../../data-access/video-sessions.api';
import {
  isVideoSessionNotFoundError,
  mapVideoSessionApiError,
} from '../../data-access/video-sessions-error.mapper';
import {
  VideoProvider,
  VideoSession,
  VideoSessionStatus,
} from '../../data-access/video-sessions.models';
import { VideoSessionStatusBadgeComponent } from '../video-session-status-badge/video-session-status-badge.component';

@Component({
  selector: 'app-video-session-action-card',
  imports: [VideoSessionStatusBadgeComponent],
  templateUrl: './video-session-action-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoSessionActionCardComponent implements OnInit, OnChanges {
  private readonly api = inject(VideoSessionsApi);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly booking = input.required<Booking>();
  readonly videoSession = input<VideoSession | null | undefined>(undefined);

  readonly videoSessionEnsured = output<VideoSession>();
  readonly bookingShouldRefresh = output<void>();

  readonly localVideoSession = signal<VideoSession | null>(null);
  readonly loadedBookingId = signal<string | null>(null);
  readonly loadingSession = signal(false);
  readonly ensuring = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.syncInputState();
  }

  ngOnChanges(): void {
    this.syncInputState();
  }

  displayedVideoSession(): VideoSession | null {
    return this.localVideoSession() ?? this.videoSession() ?? null;
  }

  canHaveVideoSession(booking: Booking): boolean {
    return booking.modality === 'remota' || booking.modality === 'hibrida';
  }

  isEligibleForSession(booking: Booking): boolean {
    return booking.status === 'confirmed' || booking.status === 'paid' || booking.status === 'in_progress';
  }

  prepareSession(): void {
    const booking = this.booking();
    if (!this.canHaveVideoSession(booking) || !this.isEligibleForSession(booking) || this.ensuring()) {
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.ensuring.set(true);

    this.api
      .ensureBookingVideoSession(booking.id)
      .pipe(
        finalize(() => this.ensuring.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (videoSession) => {
          this.localVideoSession.set(videoSession);
          this.loadedBookingId.set(booking.id);
          this.successMessage.set('Sala virtual preparada correctamente.');
          this.videoSessionEnsured.emit(videoSession);
          this.bookingShouldRefresh.emit();
        },
        error: (error: unknown) =>
          this.errorMessage.set(mapVideoSessionApiError(error, 'No pudimos preparar la sala virtual.')),
      });
  }

  joinSession(videoSession: VideoSession): void {
    if (!this.canJoin(videoSession)) {
      this.errorMessage.set(this.joinUnavailableMessage(videoSession));
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);

    void this.router.navigate(
      ['/video-sessions', this.booking().id, 'join'],
      {
        state: { videoSession },
      },
    );
  }

  canJoin(videoSession: VideoSession): boolean {
    return videoSession.can_join_now && !this.isTerminal(videoSession.status);
  }

  providerLabel(provider: VideoProvider): string {
    if (provider === 'simulator') return 'Simulador';
    if (provider === 'livekit') return 'LiveKit';
    return 'URL externa';
  }

  schedule(videoSession: VideoSession): string {
    const start = videoSession.scheduled_start_at ?? videoSession.booking?.starts_at ?? this.booking().starts_at;
    const end = videoSession.scheduled_end_at ?? videoSession.booking?.ends_at ?? this.booking().ends_at;

    return `${this.formatDateTime(start)} - ${this.formatTime(end)}`;
  }

  statusMessage(videoSession: VideoSession): string {
    if (videoSession.status === 'cancelled') return 'Esta sesion fue cancelada.';
    if (videoSession.status === 'ended') return 'Esta sesion ya finalizo.';
    if (videoSession.status === 'expired') return 'Esta sesion expiro.';
    if (videoSession.can_join_now) return 'La sala esta disponible para ingresar.';
    return 'La sala estara disponible cerca del horario de la reserva.';
  }

  bookingEligibilityMessage(booking: Booking): string {
    switch (booking.status) {
      case 'pending':
        return 'La reserva debe estar confirmada o pagada para preparar la sala.';
      case 'cancelled':
        return 'Esta reserva fue cancelada y no puede tener sala virtual.';
      case 'completed':
        return 'Esta reserva ya finalizo.';
      case 'no_show':
        return 'Esta reserva fue marcada como no asistida.';
      case 'confirmed':
      case 'paid':
      case 'in_progress':
        return 'La sala virtual se puede preparar para esta reserva.';
    }
  }

  private syncInputState(): void {
    const booking = this.booking();
    const suppliedVideoSession = this.videoSession();

    if (!this.canHaveVideoSession(booking)) {
      this.localVideoSession.set(null);
      this.loadedBookingId.set(null);
      return;
    }

    if (suppliedVideoSession) {
      this.localVideoSession.set(suppliedVideoSession);
      this.loadedBookingId.set(booking.id);
      return;
    }

    if (this.loadedBookingId() === booking.id || this.loadingSession()) return;

    this.loadExistingSession(booking.id);
  }

  private loadExistingSession(bookingId: string): void {
    this.loadingSession.set(true);
    this.errorMessage.set(null);

    this.api
      .getBookingVideoSession(bookingId)
      .pipe(
        finalize(() => this.loadingSession.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (videoSession) => {
          this.localVideoSession.set(videoSession);
          this.loadedBookingId.set(bookingId);
        },
        error: (error: unknown) => {
          this.loadedBookingId.set(bookingId);
          this.localVideoSession.set(null);
          if (!isVideoSessionNotFoundError(error)) {
            this.errorMessage.set(
              mapVideoSessionApiError(error, 'No pudimos cargar la sesion virtual.'),
            );
          }
        },
      });
  }

  private joinUnavailableMessage(videoSession: VideoSession): string {
    if (videoSession.status === 'cancelled') return 'Esta sesion virtual fue cancelada.';
    if (videoSession.status === 'ended') return 'Esta sesion virtual ya finalizo.';
    if (videoSession.status === 'expired') return 'Esta sesion virtual expiro.';
    return 'Esta sala todavia no esta disponible.';
  }

  private isTerminal(status: VideoSessionStatus | string): boolean {
    return status === 'ended' || status === 'cancelled' || status === 'expired';
  }

  private formatDateTime(value: string | null): string {
    if (!value) return 'Horario no disponible';

    const normalized = value.includes('T') ? value : value.replace(' ', 'T');
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('es-UY', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  private formatTime(value: string | null): string {
    if (!value) return 'sin fin definido';

    const normalized = value.includes('T') ? value : value.replace(' ', 'T');
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
      const timeMatch = value.match(/(\d{2}:\d{2})/);
      return timeMatch?.[1] ?? value;
    }

    return new Intl.DateTimeFormat('es-UY', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}
