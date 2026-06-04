import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ClientPackageStatus } from '../../data-access/packages.models';

@Component({
  selector: 'app-package-session-progress',
  templateUrl: './package-session-progress.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageSessionProgressComponent {
  readonly total = input.required<number>();
  readonly used = input.required<number>();
  readonly remaining = input.required<number>();
  readonly status = input<ClientPackageStatus>('active');

  readonly percentUsed = computed(() => {
    const total = this.total();
    if (total <= 0) return 0;
    return Math.min(100, Math.max(0, Math.round((this.used() / total) * 100)));
  });

  readonly statusLabel = computed(() => {
    switch (this.status()) {
      case 'active':
        return 'Activo';
      case 'depleted':
        return 'Sin sesiones disponibles';
      case 'expired':
        return 'Vencido';
      case 'cancelled':
        return 'Cancelado';
    }
  });
}
