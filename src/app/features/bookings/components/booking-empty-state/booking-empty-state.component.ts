import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BookingContext } from '../../models/booking.models';

@Component({
  selector: 'app-booking-empty-state',
  imports: [RouterLink],
  template: `
    <section class="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div class="mx-auto grid size-14 place-items-center rounded-2xl bg-indigo-50 text-sm font-black text-indigo-700">
        RS
      </div>
      <h2 class="mt-4 text-2xl font-black tracking-tight text-slate-950">{{ title() }}</h2>
      <p class="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-600">{{ description() }}</p>

      <a
        class="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 focus:outline focus:outline-2 focus:outline-indigo-700"
        [routerLink]="actionLink()"
      >
        {{ actionLabel() }}
      </a>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingEmptyStateComponent {
  readonly context = input<BookingContext>('client');
  readonly profileRequired = input(false);

  title(): string {
    if (this.profileRequired()) return 'Necesitas crear un perfil profesional';
    return this.context() === 'professional' ? 'Todavia no recibiste reservas' : 'Todavia no tenes reservas';
  }

  description(): string {
    if (this.profileRequired()) return 'Crea tu perfil profesional para gestionar reservas recibidas.';
    return this.context() === 'professional'
      ? 'Cuando tus clientes reserven servicios, los turnos apareceran aca.'
      : 'Explora servicios y reserva tu primer turno.';
  }

  actionLink(): string {
    return this.profileRequired() ? '/dashboard/profile' : '/services';
  }

  actionLabel(): string {
    return this.profileRequired() ? 'Crear perfil profesional' : 'Explorar servicios';
  }
}
