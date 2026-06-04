import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import { PackagesApi } from '../../data-access/packages.api';
import { mapPackageApiError } from '../../data-access/packages-error.mapper';
import { ClientPackage, ProfessionalProfileId, ServiceId } from '../../data-access/packages.models';

@Component({
  selector: 'app-booking-package-selector',
  templateUrl: './booking-package-selector.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingPackageSelectorComponent implements OnInit {
  private readonly api = inject(PackagesApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly serviceId = input.required<ServiceId>();
  readonly professionalId = input<ProfessionalProfileId | null>(null);
  readonly selectedStartsAt = input<string | null>(null);

  readonly clientPackageSelected = output<ClientPackage | null>();

  readonly clientPackages = signal<ClientPackage[]>([]);
  readonly selectedClientPackageId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly usableClientPackages = computed(() =>
    this.clientPackages().filter((clientPackage) => this.isUsableForService(clientPackage)),
  );

  ngOnInit(): void {
    this.loadClientPackages();
  }

  loadClientPackages(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.api
      .listMyClientPackages({
        page: 1,
        per_page: 50,
        status: 'active',
        service_id: this.serviceId(),
        professional_id: this.professionalId() ?? undefined,
      })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.clientPackages.set(response.client_packages),
        error: (error: unknown) =>
          this.errorMessage.set(mapPackageApiError(error, 'No pudimos cargar tus paquetes.')),
      });
  }

  selectClientPackage(clientPackage: ClientPackage | null): void {
    this.selectedClientPackageId.set(clientPackage?.id ?? null);
    this.clientPackageSelected.emit(clientPackage);
  }

  isSelected(clientPackage: ClientPackage | null): boolean {
    return this.selectedClientPackageId() === (clientPackage?.id ?? null);
  }

  packageName(clientPackage: ClientPackage): string {
    return clientPackage.package_product?.name ?? 'Paquete de sesiones';
  }

  expiresLabel(clientPackage: ClientPackage): string {
    if (!clientPackage.expires_at) return 'Sin vencimiento definido';

    const normalized = clientPackage.expires_at.includes('T')
      ? clientPackage.expires_at
      : clientPackage.expires_at.replace(' ', 'T');
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) return `Vence ${clientPackage.expires_at}`;

    return `Vence el ${new Intl.DateTimeFormat('es-UY', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date)}`;
  }

  private isUsableForService(clientPackage: ClientPackage): boolean {
    if (clientPackage.status !== 'active') return false;
    if (clientPackage.remaining_sessions <= 0) return false;

    const packageServiceId = clientPackage.service_id;
    return packageServiceId === null || String(packageServiceId) === String(this.serviceId());
  }
}
