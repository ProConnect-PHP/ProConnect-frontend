import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-sidebar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="grid gap-1" aria-label="Navegacion administrativa">
      @for (item of items; track item.path) {
        <a
          [routerLink]="item.path"
          routerLinkActive="bg-slate-950 text-white"
          [routerLinkActiveOptions]="{ exact: item.exact }"
          class="rounded-2xl px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-950"
        >
          {{ item.label }}
        </a>
      }
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSidebarComponent {
  protected readonly items = [
    { label: 'Dashboard', path: '/admin', exact: true },
    { label: 'Usuarios', path: '/admin/users', exact: false },
    { label: 'Activity Logs', path: '/admin/activity-logs', exact: false },
  ];
}
