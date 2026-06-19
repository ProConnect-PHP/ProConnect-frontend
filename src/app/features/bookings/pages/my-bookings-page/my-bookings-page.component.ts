import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { BookingsApi } from '../../data-access/bookings.api';
import { Booking, BookingListFilter } from '../../models/booking.models';
import { isPastBooking } from '../../utils/booking-date-format.util';
import { bookingErrorMessage } from '../../utils/booking-error-message.util';
import { BookingCancelDialogComponent } from '../../components/booking-cancel-dialog/booking-cancel-dialog.component';
import { BookingCardComponent } from '../../components/booking-card/booking-card.component';
import { BookingEmptyStateComponent } from '../../components/booking-empty-state/booking-empty-state.component';
import { BookingFiltersComponent } from '../../components/booking-filters/booking-filters.component';
import { BookingRescheduleDialogComponent } from '../../components/booking-reschedule-dialog/booking-reschedule-dialog.component';
import { BookingSkeletonComponent } from '../../components/booking-skeleton/booking-skeleton.component';

@Component({
  selector: 'app-my-bookings-page',
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
  templateUrl: './my-bookings-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyBookingsPageComponent implements OnInit {
  private readonly api = inject(BookingsApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly bookings = signal<Booking[]>([]);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);
  readonly activeFilter = signal<BookingListFilter>('upcoming');
  readonly selectedCancelBooking = signal<Booking | null>(null);
  readonly selectedRescheduleBooking = signal<Booking | null>(null);

  readonly filteredBookings = computed(() => {
    const filter = this.activeFilter();

    return this.bookings().filter((booking) => {
      if (filter === 'all') return true;
      if (filter === 'cancelled') return booking.status === 'cancelled';
      if (filter === 'past') return booking.status !== 'cancelled' && isPastBooking(booking.ends_at);
      return booking.status !== 'cancelled' && !isPastBooking(booking.ends_at);
    });
  });

  readonly skeletonItems = [0, 1, 2];

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.api
      .listMyBookings()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.bookings.set(response.bookings),
        error: (error: unknown) => this.errorMessage.set(bookingErrorMessage(error)),
      });
  }

  setFilter(filter: BookingListFilter): void {
    if (this.activeFilter() === filter) {
      return;
    }

    this.activeFilter.set(filter);
    this.successMessage.set(null);
    this.errorMessage.set(null);
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

    this.closeDialogs();
    this.errorMessage.set(null);
    this.successMessage.set(message);
  }
}
