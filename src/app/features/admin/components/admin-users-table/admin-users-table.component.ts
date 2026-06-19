import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AdminUser, AdminUserStatus } from '../../models/admin-user.model';

@Component({
  selector: 'app-admin-users-table',
  imports: [RouterLink],
  template: `
    <div class="grid gap-3 lg:hidden">
      @for (user of users(); track user.id) {
        <article class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <h2 class="truncate text-base font-black text-slate-950">{{ user.name }}</h2>
              <p class="mt-1 truncate text-sm text-slate-600">{{ user.email }}</p>
            </div>
            <span [class]="statusClass(user.status)">{{ statusLabel(user.status) }}</span>
          </div>

          <dl class="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt class="font-bold text-slate-500">Rol</dt>
              <dd class="mt-1 font-semibold text-slate-900">{{ roleLabel(user.role) }}</dd>
            </div>
            <div>
              <dt class="font-bold text-slate-500">Alta</dt>
              <dd class="mt-1 font-semibold text-slate-900">{{ dateLabel(user.created_at) }}</dd>
            </div>
          </dl>

          <div class="mt-4 grid gap-2 sm:grid-cols-2">
            <a
              [routerLink]="['/admin/users', user.id]"
              class="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline focus:outline-2 focus:outline-indigo-600"
            >
              Ver detalle
            </a>
            <button
              type="button"
              class="inline-flex min-h-11 items-center justify-center rounded-xl px-4 py-2 text-sm font-bold transition focus:outline focus:outline-2 disabled:cursor-not-allowed disabled:opacity-60"
              [class.bg-rose-600]="user.status === 'active'"
              [class.text-white]="user.status === 'active'"
              [class.hover:bg-rose-700]="user.status === 'active'"
              [class.focus:outline-rose-700]="user.status === 'active'"
              [class.bg-emerald-600]="user.status === 'disabled'"
              [class.text-white]="user.status === 'disabled'"
              [class.hover:bg-emerald-700]="user.status === 'disabled'"
              [class.focus:outline-emerald-700]="user.status === 'disabled'"
              [disabled]="updatingUserId() === user.id"
              (click)="statusChange.emit({ user, status: nextStatus(user.status) })"
            >
              {{ actionLabel(user.status, updatingUserId() === user.id) }}
            </button>
          </div>
        </article>
      }
    </div>

    <div class="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm lg:block">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th scope="col" class="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-500">Usuario</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-500">Rol</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-500">Estado</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-black uppercase tracking-wide text-slate-500">Alta</th>
            <th scope="col" class="px-4 py-3 text-right text-xs font-black uppercase tracking-wide text-slate-500">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          @for (user of users(); track user.id) {
            <tr>
              <td class="px-4 py-4">
                <div class="min-w-0">
                  <p class="truncate text-sm font-black text-slate-950">{{ user.name }}</p>
                  <p class="mt-1 truncate text-sm text-slate-600">{{ user.email }}</p>
                </div>
              </td>
              <td class="px-4 py-4 text-sm font-semibold text-slate-700">{{ roleLabel(user.role) }}</td>
              <td class="px-4 py-4"><span [class]="statusClass(user.status)">{{ statusLabel(user.status) }}</span></td>
              <td class="px-4 py-4 text-sm font-semibold text-slate-700">{{ dateLabel(user.created_at) }}</td>
              <td class="px-4 py-4">
                <div class="flex justify-end gap-2">
                  <a
                    [routerLink]="['/admin/users', user.id]"
                    class="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline focus:outline-2 focus:outline-indigo-600"
                  >
                    Ver detalle
                  </a>
                  <button
                    type="button"
                    class="inline-flex min-h-10 items-center justify-center rounded-xl px-3 py-2 text-sm font-bold text-white transition focus:outline focus:outline-2 disabled:cursor-not-allowed disabled:opacity-60"
                    [class.bg-rose-600]="user.status === 'active'"
                    [class.hover:bg-rose-700]="user.status === 'active'"
                    [class.focus:outline-rose-700]="user.status === 'active'"
                    [class.bg-emerald-600]="user.status === 'disabled'"
                    [class.hover:bg-emerald-700]="user.status === 'disabled'"
                    [class.focus:outline-emerald-700]="user.status === 'disabled'"
                    [disabled]="updatingUserId() === user.id"
                    (click)="statusChange.emit({ user, status: nextStatus(user.status) })"
                  >
                    {{ actionLabel(user.status, updatingUserId() === user.id) }}
                  </button>
                </div>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersTableComponent {
  readonly users = input<AdminUser[]>([]);
  readonly updatingUserId = input<string | null>(null);
  readonly statusChange = output<{ user: AdminUser; status: AdminUserStatus }>();

  roleLabel(role: string): string {
    if (role === 'professional') return 'Profesional';
    if (role === 'admin') return 'Admin';
    return 'Cliente';
  }

  statusLabel(status: AdminUserStatus): string {
    return status === 'disabled' ? 'Deshabilitado' : 'Activo';
  }

  statusClass(status: AdminUserStatus): string {
    const base = 'inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-black';
    return status === 'disabled'
      ? `${base} bg-rose-50 text-rose-700 ring-1 ring-rose-200`
      : `${base} bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200`;
  }

  nextStatus(status: AdminUserStatus): AdminUserStatus {
    return status === 'disabled' ? 'active' : 'disabled';
  }

  actionLabel(status: AdminUserStatus, updating: boolean): string {
    if (updating) return 'Guardando...';
    return status === 'disabled' ? 'Activar' : 'Deshabilitar';
  }

  dateLabel(value: string): string {
    if (!value) return '-';
    return new Intl.DateTimeFormat('es-UY', { dateStyle: 'medium' }).format(new Date(value));
  }
}
