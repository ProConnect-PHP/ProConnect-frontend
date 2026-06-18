import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ActivityLog } from '../../models/activity-log.model';

@Component({
  selector: 'app-admin-activity-log-table',
  host: {
    class: 'block w-full min-w-0',
  },
  template: `
    <div class="w-full min-w-0">
      <div class="grid gap-3 lg:hidden">
        @for (log of logs(); track log.id) {
          <article class="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h2 class="truncate text-sm font-black text-slate-950" [title]="log.event">
                  {{ log.event }}
                </h2>
                <p class="mt-1 truncate text-xs font-semibold text-slate-500" [title]="log.id">
                  {{ datePart(log.created_at) }} - {{ timePart(log.created_at) }} - {{ log.id }}
                </p>
              </div>

              <span [class]="severityClass(log.severity)">
                <span
                  class="mr-1.5 h-1.5 w-1.5 rounded-full"
                  [class]="severityDotClass(log.severity)"
                ></span>
                {{ log.severity || 'info' }}
              </span>
            </div>

            <dl class="mt-4 grid grid-cols-2 gap-3 text-xs">
              <div class="min-w-0">
                <dt class="font-bold uppercase tracking-wide text-slate-400">Actor</dt>
                <dd
                  class="mt-1 truncate font-bold text-slate-700"
                  [title]="log.actor_email || 'Sin actor'"
                >
                  {{ log.actor_email || 'Sin actor' }}
                </dd>
              </div>

              <div class="min-w-0">
                <dt class="font-bold uppercase tracking-wide text-slate-400">Rol</dt>
                <dd class="mt-1">
                  <span [class]="roleClass(log.actor_role)">
                    {{ log.actor_role || '-' }}
                  </span>
                </dd>
              </div>

              <div class="min-w-0">
                <dt class="font-bold uppercase tracking-wide text-slate-400">Acting as</dt>
                <dd class="mt-1 truncate font-bold text-slate-700" [title]="log.acting_as || '-'">
                  {{ log.acting_as || '-' }}
                </dd>
              </div>

              <div class="min-w-0">
                <dt class="font-bold uppercase tracking-wide text-slate-400">Metodo</dt>
                <dd class="mt-1">
                  <span [class]="methodClass(log.method)">
                    {{ log.method || '-' }}
                  </span>
                </dd>
              </div>

              <div class="min-w-0">
                <dt class="font-bold uppercase tracking-wide text-slate-400">Status</dt>
                <dd class="mt-1">
                  <span [class]="statusClass(log.status_code)">
                    {{ log.status_code ?? '-' }}
                  </span>
                </dd>
              </div>
            </dl>

            @if (entityLabel(log) !== '-') {
              <div class="mt-4 rounded-xl bg-slate-50 p-3">
                <p class="text-xs font-bold uppercase tracking-wide text-slate-400">Entidad</p>
                <p class="mt-1 break-words text-xs font-bold text-slate-700">
                  {{ entityLabel(log) }}
                </p>
              </div>
            }

            @if (log.path) {
              <code
                class="mt-3 block break-words rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-slate-100"
              >
                {{ log.path }}
              </code>
            }
          </article>
        }
      </div>

      <div class="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:block">
        <div class="border-b border-slate-100 px-4 py-4 sm:px-5">
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-sm font-black uppercase tracking-wide text-slate-500">
                Eventos registrados
              </h2>
              <p class="mt-1 text-sm text-slate-500">
                Trazabilidad operativa de acciones sensibles del sistema.
              </p>
            </div>

            <span class="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
              {{ logs().length }} registros
            </span>
          </div>
        </div>

        <div class="w-full overflow-x-auto">
          <table class="w-full min-w-[1120px] divide-y divide-slate-200">
            <thead class="bg-slate-50/80">
              <tr>
                @for (heading of headings; track heading) {
                  <th
                    scope="col"
                    class="px-4 py-3 text-left text-[11px] font-black uppercase tracking-wider text-slate-500"
                  >
                    {{ heading }}
                  </th>
                }
              </tr>
            </thead>

            <tbody class="divide-y divide-slate-100 bg-white">
              @for (log of logs(); track log.id) {
                <tr class="transition hover:bg-slate-50/80">
                  <td class="whitespace-nowrap px-4 py-4 align-top">
                    <div class="text-sm font-black text-slate-900">
                      {{ datePart(log.created_at) }}
                    </div>
                    <div class="mt-0.5 text-xs font-semibold text-slate-500">
                      {{ timePart(log.created_at) }}
                    </div>
                  </td>

                  <td class="px-4 py-4 align-top">
                    <div class="max-w-[260px]">
                      <p class="truncate text-sm font-black text-slate-950" [title]="log.event">
                        {{ log.event }}
                      </p>
                      <p class="mt-1 text-xs font-semibold text-slate-500">
                        {{ log.id }}
                      </p>
                    </div>
                  </td>

                  <td class="whitespace-nowrap px-4 py-4 align-top">
                    <span [class]="severityClass(log.severity)">
                      <span
                        class="mr-1.5 h-1.5 w-1.5 rounded-full"
                        [class]="severityDotClass(log.severity)"
                      ></span>
                      {{ log.severity || 'info' }}
                    </span>
                  </td>

                  <td class="px-4 py-4 align-top">
                    <div class="max-w-[220px]">
                      <p class="truncate text-sm font-bold text-slate-800" [title]="log.actor_email || '-'">
                        {{ log.actor_email || 'Sin actor' }}
                      </p>
                      <p class="mt-1 text-xs font-semibold text-slate-500">
                        {{ log.actor_id || 'system/guest' }}
                      </p>
                    </div>
                  </td>

                  <td class="whitespace-nowrap px-4 py-4 align-top">
                    <span [class]="roleClass(log.actor_role)">
                      {{ log.actor_role || '-' }}
                    </span>
                  </td>

                  <td class="whitespace-nowrap px-4 py-4 align-top">
                    <span class="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700 ring-1 ring-slate-200">
                      {{ log.acting_as || '-' }}
                    </span>
                  </td>

                  <td class="px-4 py-4 align-top">
                    <div class="max-w-[220px]">
                      <p class="truncate text-sm font-bold text-slate-800" [title]="entityLabel(log)">
                        {{ entityLabel(log) }}
                      </p>
                    </div>
                  </td>

                  <td class="whitespace-nowrap px-4 py-4 align-top">
                    <span [class]="methodClass(log.method)">
                      {{ log.method || '-' }}
                    </span>
                  </td>

                  <td class="px-4 py-4 align-top">
                    <code
                      class="block max-w-[300px] truncate rounded-xl bg-slate-950 px-3 py-2 text-xs font-bold text-slate-100"
                      [title]="log.path || '-'"
                    >
                      {{ log.path || '-' }}
                    </code>
                  </td>

                  <td class="whitespace-nowrap px-4 py-4 align-top">
                    <span [class]="statusClass(log.status_code)">
                      {{ log.status_code ?? '-' }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminActivityLogTableComponent {
  readonly logs = input<ActivityLog[]>([]);

  protected readonly headings = [
    'Fecha',
    'Evento',
    'Severidad',
    'Actor',
    'Rol',
    'Acting as',
    'Entidad',
    'Método',
    'Path',
    'Status',
  ];

  severityClass(severity: string | null | undefined): string {
    const base = 'inline-flex shrink-0 items-center rounded-full px-3 py-1 text-xs font-black ring-1';

    if (severity === 'error' || severity === 'critical') {
      return `${base} bg-rose-50 text-rose-700 ring-rose-200`;
    }

    if (severity === 'warning') {
      return `${base} bg-amber-50 text-amber-800 ring-amber-200`;
    }

    return `${base} bg-emerald-50 text-emerald-700 ring-emerald-200`;
  }

  severityDotClass(severity: string | null | undefined): string {
    if (severity === 'error' || severity === 'critical') {
      return 'bg-rose-500';
    }

    if (severity === 'warning') {
      return 'bg-amber-500';
    }

    return 'bg-emerald-500';
  }

  roleClass(role: string | null | undefined): string {
    const base = 'inline-flex rounded-full px-2.5 py-1 text-xs font-black ring-1';

    if (role === 'admin') {
      return `${base} bg-indigo-50 text-indigo-700 ring-indigo-200`;
    }

    if (role === 'professional') {
      return `${base} bg-sky-50 text-sky-700 ring-sky-200`;
    }

    if (role === 'client') {
      return `${base} bg-emerald-50 text-emerald-700 ring-emerald-200`;
    }

    return `${base} bg-slate-100 text-slate-700 ring-slate-200`;
  }

  methodClass(method: string | null | undefined): string {
    const base = 'inline-flex min-w-14 justify-center rounded-lg px-2.5 py-1 text-xs font-black ring-1';

    if (method === 'POST') {
      return `${base} bg-emerald-50 text-emerald-700 ring-emerald-200`;
    }

    if (method === 'PATCH' || method === 'PUT') {
      return `${base} bg-amber-50 text-amber-800 ring-amber-200`;
    }

    if (method === 'DELETE') {
      return `${base} bg-rose-50 text-rose-700 ring-rose-200`;
    }

    if (method === 'GET') {
      return `${base} bg-sky-50 text-sky-700 ring-sky-200`;
    }

    return `${base} bg-slate-100 text-slate-700 ring-slate-200`;
  }

  statusClass(statusCode: number | null | undefined): string {
    const base = 'inline-flex min-w-12 justify-center rounded-lg px-2.5 py-1 text-xs font-black ring-1';

    if (!statusCode) {
      return `${base} bg-slate-100 text-slate-600 ring-slate-200`;
    }

    if (statusCode >= 500) {
      return `${base} bg-rose-50 text-rose-700 ring-rose-200`;
    }

    if (statusCode >= 400) {
      return `${base} bg-amber-50 text-amber-800 ring-amber-200`;
    }

    if (statusCode >= 300) {
      return `${base} bg-violet-50 text-violet-700 ring-violet-200`;
    }

    return `${base} bg-emerald-50 text-emerald-700 ring-emerald-200`;
  }

  entityLabel(log: ActivityLog): string {
    if (!log.entity_type && !log.entity_id) {
      return '-';
    }

    return [log.entity_type, log.entity_id].filter(Boolean).join(' #');
  }

  datePart(value: string): string {
    if (!value) {
      return '-';
    }

    return new Intl.DateTimeFormat('es-UY', {
      dateStyle: 'short',
    }).format(new Date(value));
  }

  timePart(value: string): string {
    if (!value) {
      return '-';
    }

    return new Intl.DateTimeFormat('es-UY', {
      timeStyle: 'short',
    }).format(new Date(value));
  }
}
