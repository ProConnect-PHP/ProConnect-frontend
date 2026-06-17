import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ApiClientError } from '../../../../core/http/models/api-error.model';
import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { AppLoadingSpinnerComponent } from '../../../../shared/ui/loading-spinner/loading-spinner.component';
import { ProfessionalSoldPackageCardComponent } from '../../components/professional-sold-package-card/professional-sold-package-card.component';
import { PackagesApi } from '../../data-access/packages.api';
import { mapPackageApiError } from '../../data-access/packages-error.mapper';
import { ClientPackage, ClientPackageStatus } from '../../data-access/packages.models';

type PackageFilter = 'all' | ClientPackageStatus;

@Component({
  selector: 'app-professional-sold-packages-page',
  imports: [
    RouterLink,
    AppAlertComponent,
    AppEmptyStateComponent,
    AppLoadingSpinnerComponent,
    ProfessionalSoldPackageCardComponent,
  ],
  templateUrl: './professional-sold-packages-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalSoldPackagesPageComponent implements OnInit {
  private readonly api = inject(PackagesApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly clientPackages = signal<ClientPackage[]>([]);
  readonly loading = signal(false);
  readonly profileRequired = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly activeFilter = signal<PackageFilter>('all');

  readonly filters: { value: PackageFilter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'active', label: 'Activos' },
    { value: 'depleted', label: 'Sin sesiones' },
    { value: 'expired', label: 'Vencidos' },
    { value: 'cancelled', label: 'Cancelados' },
  ];

  ngOnInit(): void {
    this.loadSoldPackages();
  }

  setFilter(filter: PackageFilter): void {
    if (this.activeFilter() === filter) {
      return;
    }

    this.activeFilter.set(filter);
    this.loadSoldPackages();
  }

  loadSoldPackages(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.profileRequired.set(false);

    const filter = this.activeFilter();

    this.api
      .listProfessionalSoldPackages({
        page: 1,
        per_page: 50,
        status: filter === 'all' ? undefined : filter,
      })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.clientPackages.set(response.client_packages),
        error: (error: unknown) => {
          this.clientPackages.set([]);

          this.errorMessage.set(
            mapPackageApiError(error, 'No pudimos cargar los paquetes vendidos.'),
          );

          this.profileRequired.set(
            error instanceof ApiClientError && error.type === 'ProfessionalProfileRequired',
          );
        },
      });
  }
}
