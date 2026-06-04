import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { formatMoney } from '../../../../shared/utils/money.util';
import { ClientPackage } from '../../data-access/packages.models';
import { PackageSessionProgressComponent } from '../package-session-progress/package-session-progress.component';

@Component({
  selector: 'app-professional-sold-package-card',
  imports: [PackageSessionProgressComponent],
  templateUrl: './professional-sold-package-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalSoldPackageCardComponent {
  readonly clientPackage = input.required<ClientPackage>();

  packageName(clientPackage: ClientPackage): string {
    return clientPackage.package_product?.name ?? 'Paquete vendido';
  }

  clientName(clientPackage: ClientPackage): string {
    return clientPackage.client?.name ?? clientPackage.client_id;
  }

  serviceName(clientPackage: ClientPackage): string {
    return clientPackage.service?.name ?? clientPackage.package_product?.service?.name ?? 'Servicios compatibles';
  }

  statusLabel(clientPackage: ClientPackage): string {
    switch (clientPackage.status) {
      case 'active':
        return 'Activo';
      case 'depleted':
        return 'Sin sesiones disponibles';
      case 'expired':
        return 'Vencido';
      case 'cancelled':
        return 'Cancelado';
    }
  }

  money(clientPackage: ClientPackage): string {
    return formatMoney(clientPackage.price_snapshot, clientPackage.currency);
  }

  formatDate(value: string | null): string {
    if (!value) return 'No disponible';
    const normalized = value.includes('T') ? value : value.replace(' ', 'T');
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('es-UY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }
}
