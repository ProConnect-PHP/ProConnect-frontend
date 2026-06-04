import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { BookingPackageSelectorComponent } from '../../../packages/components/booking-package-selector/booking-package-selector.component';
import { ClientPackage } from '../../../packages/data-access/packages.models';
import { AvailabilitySlot, PublicService } from '../../../public-discovery/models/public-discovery.models';
import { formatPrice } from '../../../public-discovery/utils/price-format.util';
import { formatBookingDate, formatBookingTimeRange } from '../../utils/booking-date-format.util';

export type CreateBookingSubmission = {
  slot: AvailabilitySlot;
  clientPackage: ClientPackage | null;
};

@Component({
  selector: 'app-create-booking-panel',
  imports: [AppAlertComponent, BookingPackageSelectorComponent],
  template: `
    <aside class="sticky top-24 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p class="text-xs font-bold uppercase tracking-wide text-indigo-600">Reserva</p>
        <h2 class="mt-2 text-2xl font-black tracking-tight text-slate-950">Resumen del turno</h2>
      </div>

      <dl class="mt-5 grid gap-3 text-sm">
        <div class="rounded-2xl bg-slate-50 p-3">
          <dt class="font-semibold text-slate-500">Servicio</dt>
          <dd class="mt-1 font-bold text-slate-950">{{ service().name }}</dd>
        </div>
        <div class="rounded-2xl bg-slate-50 p-3">
          <dt class="font-semibold text-slate-500">Profesional</dt>
          <dd class="mt-1 font-bold text-slate-950">{{ professionalName() }}</dd>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-2xl bg-slate-50 p-3">
            <dt class="font-semibold text-slate-500">Precio</dt>
            <dd class="mt-1 font-bold text-slate-950">{{ price(service().price) }}</dd>
          </div>
          <div class="rounded-2xl bg-slate-50 p-3">
            <dt class="font-semibold text-slate-500">Modalidad</dt>
            <dd class="mt-1 font-bold text-slate-950">{{ service().modality }}</dd>
          </div>
        </div>

        @if (selectedSlot(); as slot) {
          <div class="rounded-2xl border border-indigo-200 bg-indigo-50 p-3">
            <dt class="font-semibold text-indigo-700">Horario seleccionado</dt>
            <dd class="mt-1 font-bold text-indigo-950">{{ date(slot) }}</dd>
            <dd class="mt-1 text-indigo-900">{{ timeRange(slot) }}</dd>
          </div>
        } @else {
          <div class="rounded-2xl border border-dashed border-slate-300 bg-white p-3">
            <dt class="font-semibold text-slate-600">Horario</dt>
            <dd class="mt-1 text-slate-500">Selecciona un horario disponible.</dd>
          </div>
        }

        <div class="rounded-2xl bg-amber-50 p-3 text-amber-950">
          <dt class="font-semibold">Estado inicial</dt>
          <dd class="mt-1">Pendiente de confirmacion</dd>
        </div>
      </dl>

      @if (isAuthenticated()) {
        <div class="mt-5">
          <app-booking-package-selector
            [serviceId]="service().id"
            [professionalId]="service().professional?.id ?? null"
            [selectedStartsAt]="selectedSlot()?.starts_at ?? null"
            (clientPackageSelected)="onClientPackageSelected($event)"
          />
        </div>
      }

      <div class="mt-5">
        <app-alert [message]="error()" variant="danger" />
      </div>

      <button
        type="button"
        class="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-black text-white shadow-sm transition hover:bg-indigo-700 focus:outline focus:outline-2 focus:outline-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        [disabled]="!selectedSlot() || loading()"
        (click)="submit()"
      >
        {{ buttonLabel() }}
      </button>
    </aside>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateBookingPanelComponent {
  readonly service = input.required<PublicService>();
  readonly selectedSlot = input<AvailabilitySlot | null>(null);
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly isAuthenticated = input(false);

  readonly bookingSubmitted = output<CreateBookingSubmission>();

  readonly selectedClientPackage = signal<ClientPackage | null>(null);

  submit(): void {
    const selectedSlot = this.selectedSlot();
    if (!selectedSlot || this.loading()) return;
    this.bookingSubmitted.emit({
      slot: selectedSlot,
      clientPackage: this.selectedClientPackage(),
    });
  }

  onClientPackageSelected(clientPackage: ClientPackage | null): void {
    this.selectedClientPackage.set(clientPackage);
  }

  buttonLabel(): string {
    if (this.loading()) return 'Creando reserva...';
    if (this.selectedSlot() && this.selectedClientPackage()) return 'Reservar usando paquete';
    return this.selectedSlot() ? 'Reservar turno' : 'Selecciona un horario';
  }

  professionalName(): string {
    return this.service().professional?.user?.name ?? 'Profesional';
  }

  price(value: string | number): string {
    return formatPrice(value);
  }

  date(slot: AvailabilitySlot): string {
    return formatBookingDate(slot.starts_at);
  }

  timeRange(slot: AvailabilitySlot): string {
    return formatBookingTimeRange(slot.starts_at, slot.ends_at);
  }
}
