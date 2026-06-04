import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { formatMoney } from '../../../../shared/utils/money.util';
import { ClientPackage } from '../../data-access/packages.models';
import { PackageSessionProgressComponent } from '../package-session-progress/package-session-progress.component';

@Component({
  selector: 'app-client-package-card',
  imports: [RouterLink, PackageSessionProgressComponent],
  templateUrl: './client-package-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientPackageCardComponent {
  readonly clientPackage = input.required<ClientPackage>();
  readonly showActions = input(true);

  readonly bookClicked = output<ClientPackage>();
  readonly detailClicked = output<ClientPackage>();

  readonly canBook = computed(
    () =>
      this.clientPackage().status === 'active' &&
      this.clientPackage().remaining_sessions > 0,
  );

  packageName(clientPackage: ClientPackage): string {
    return clientPackage.package_product?.name ?? 'Paquete de sesiones';
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
