import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { ApiClientError } from '../../../../core/http/models/api-error.model';
import { BookingsApi } from '../../data-access/bookings.api';
import { Booking, BookingListFilter } from '../../models/booking.models';
import { bookingErrorMessage } from '../../utils/booking-error-message.util';
import { BookingCancelDialogComponent } from '../../components/booking-cancel-dialog/booking-cancel-dialog.component';
import { BookingCardComponent } from '../../components/booking-card/booking-card.component';
import { BookingEmptyStateComponent } from '../../components/booking-empty-state/booking-empty-state.component';
import { BookingFiltersComponent } from '../../components/booking-filters/booking-filters.component';
import { BookingRescheduleDialogComponent } from '../../components/booking-reschedule-dialog/booking-reschedule-dialog.component';
import { BookingSkeletonComponent } from '../../components/booking-skeleton/booking-skeleton.component';

type ActionState = {
  bookingId: string;
  action: 'confirm';
};

@Component({
  selector: 'app-professional-bookings-page',
  imports: [
    RouterLink,
    AppAlertComponent,
    BookingCancelDialogComponent,
    BookingCardComponent,
    BookingEmptyStateComponent,
    BookingFiltersComponent,
    BookingRescheduleDialogComponent,
    BookingSkeletonComponent,
  ],
  templateUrl: './professional-bookings-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalBookingsPageComponent implements OnInit {
  private readonly api = inject(BookingsApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly bookings = signal<Booking[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly profileRequired = signal(false);
  readonly activeFilter = signal<BookingListFilter>('pending');
  readonly dateFilter = signal<string | null>(null);
  readonly selectedCancelBooking = signal<Booking | null>(null);
  readonly selectedRescheduleBooking = signal<Booking | null>(null);
  readonly actionState = signal<ActionState | null>(null);

  readonly filteredBookings = computed(() => {
    const filter = this.activeFilter();
    const date = this.dateFilter();

    return this.bookings().filter((booking) => {
      const matchesDate = date ? booking.starts_at.startsWith(date) : true;
      if (!matchesDate) return false;
      if (filter === 'all') return true;
      if (filter === 'pending') return booking.status === 'pending';
      if (filter === 'confirmed') return booking.status === 'confirmed';
      if (filter === 'cancelled') return booking.status === 'cancelled';
      return true;
    });
  });

  readonly skeletonItems = [0, 1, 2];

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.profileRequired.set(false);

    this.api
      .listProfessionalBookings()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.bookings.set(response.bookings),
        error: (error: unknown) => {
          this.errorMessage.set(bookingErrorMessage(error));
          this.profileRequired.set(
            error instanceof ApiClientError && error.type === 'ProfessionalProfileRequired',
          );
        },
      });
  }

  setFilter(filter: BookingListFilter): void {
    this.activeFilter.set(filter);
  }

  setDateFilter(date: string | null): void {
    this.dateFilter.set(date);
  }

  confirmBooking(booking: Booking): void {
    this.actionState.set({ bookingId: booking.id, action: 'confirm' });
    this.errorMessage.set(null);

    this.api
      .confirmBooking(booking.id)
      .pipe(
        finalize(() => this.actionState.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.onBookingUpdated(response.booking, 'Reserva confirmada correctamente.'),
        error: (error: unknown) => this.errorMessage.set(bookingErrorMessage(error)),
      });
  }

  openCancelDialog(booking: Booking): void {
    this.selectedCancelBooking.set(booking);
  }

  openRescheduleDialog(booking: Booking): void {
    this.selectedRescheduleBooking.set(booking);
  }

  closeDialogs(): void {
    this.selectedCancelBooking.set(null);
    this.selectedRescheduleBooking.set(null);
  }

  onBookingUpdated(booking: Booking, message: string): void {
    this.bookings.update((bookings) =>
      bookings.map((item) => (item.id === booking.id ? { ...item, ...booking } : item)),
    );
    this.successMessage.set(message);
  }

  cardLoadingAction(booking: Booking): string | null {
    const state = this.actionState();
    return state?.bookingId === booking.id ? state.action : null;
  }
}
