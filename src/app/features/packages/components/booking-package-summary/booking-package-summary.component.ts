import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Booking } from '../../../bookings/models/booking.models';

@Component({
  selector: 'app-booking-package-summary',
  templateUrl: './booking-package-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingPackageSummaryComponent {
  readonly booking = input.required<Booking>();

  packageName(): string {
    return this.booking().client_package?.package_product?.name ?? 'Paquete de sesiones';
  }

  sessionStatusLabel(): string {
    switch (this.booking().package_session?.status) {
      case 'reserved':
        return 'Sesion reservada';
      case 'consumed':
        return 'Sesion consumida';
      case 'released':
        return 'Sesion liberada';
      case 'cancelled':
        return 'Sesion cancelada';
      default:
        return 'Sesion de paquete';
    }
  }
}
