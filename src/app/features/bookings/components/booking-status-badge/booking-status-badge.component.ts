import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { BookingStatus } from '../../models/booking.models';
import { bookingStatusClasses, bookingStatusLabel } from '../../utils/booking-status-label.util';

@Component({
  selector: 'app-booking-status-badge',
  template: `<span [class]="classes()">{{ label() }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingStatusBadgeComponent {
  readonly status = input.required<BookingStatus>();

  readonly label = computed(() => bookingStatusLabel(this.status()));
  readonly classes = computed(() => bookingStatusClasses(this.status()));
}
