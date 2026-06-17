import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { AppLoadingSpinnerComponent } from '../../../../shared/ui/loading-spinner/loading-spinner.component';
import { ClientPackageCardComponent } from '../../components/client-package-card/client-package-card.component';
import { PackagesApi } from '../../data-access/packages.api';
import { mapPackageApiError } from '../../data-access/packages-error.mapper';
import { ClientPackage, ClientPackageStatus, PackagesPaginationMeta } from '../../data-access/packages.models';

type PackageFilter = 'all' | ClientPackageStatus;

const initialMeta: PackagesPaginationMeta = {
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
};

@Component({
  selector: 'app-my-packages-page',
  imports: [
    RouterLink,
    AppAlertComponent,
    AppEmptyStateComponent,
    AppLoadingSpinnerComponent,
    ClientPackageCardComponent,
  ],
  templateUrl: './my-packages-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyPackagesPageComponent implements OnInit {
  private readonly api = inject(PackagesApi);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly clientPackages = signal<ClientPackage[]>([]);
  readonly meta = signal<PackagesPaginationMeta>(initialMeta);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly activeFilter = signal<PackageFilter>('all');
  readonly page = signal(1);
  readonly perPage = 10;

  readonly filters: { value: PackageFilter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activos' },
    { value: 'depleted', label: 'Sin sesiones' },
    { value: 'expired', label: 'Vencidos' },
    { value: 'cancelled', label: 'Cancelados' },
  ];

  ngOnInit(): void {
    this.loadPackages();
  }

  setFilter(filter: PackageFilter): void {
    if (this.activeFilter() === filter) {
      return;
    }

    this.activeFilter.set(filter);
    this.loadPackages(1);
  }

  loadPackages(page = this.page()): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.page.set(page);

    const filter = this.activeFilter();

    this.api
      .listMyClientPackages({
        page,
        per_page: this.perPage,
        status: filter === 'all' ? undefined : filter,
      })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.clientPackages.set(response.client_packages);
          this.meta.set(response.meta);
          this.page.set(response.meta.current_page);
        },
        error: (error: unknown) =>
          this.errorMessage.set(mapPackageApiError(error, 'No pudimos cargar tus paquetes.')),
      });
  }

  bookPackage(clientPackage: ClientPackage): void {
    if (clientPackage.service_id) {
      void this.router.navigate(['/services', clientPackage.service_id]);
      return;
    }

    this.errorMessage.set('Este paquete puede usarse con servicios compatibles del profesional.');
  }
}
