import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { AppLoadingSpinnerComponent } from '../../../../shared/ui/loading-spinner/loading-spinner.component';
import { ClientPackageCardComponent } from '../../components/client-package-card/client-package-card.component';
import { PackagesApi } from '../../data-access/packages.api';
import { mapPackageApiError } from '../../data-access/packages-error.mapper';
import { ClientPackage } from '../../data-access/packages.models';

@Component({
  selector: 'app-client-package-detail-page',
  imports: [
    RouterLink,
    AppAlertComponent,
    AppEmptyStateComponent,
    AppLoadingSpinnerComponent,
    ClientPackageCardComponent,
  ],
  templateUrl: './client-package-detail-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClientPackageDetailPageComponent implements OnInit {
  private readonly api = inject(PackagesApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly clientPackage = signal<ClientPackage | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => params.get('clientPackageId')),
        switchMap((clientPackageId) => this.fetchClientPackage(clientPackageId)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((clientPackage) => this.clientPackage.set(clientPackage));
  }

  bookPackage(clientPackage: ClientPackage): void {
    if (clientPackage.service_id) {
      void this.router.navigate(['/services', clientPackage.service_id]);
      return;
    }

    this.errorMessage.set('Este paquete puede usarse con servicios compatibles del profesional.');
  }

  private fetchClientPackage(clientPackageId: string | null) {
    this.loading.set(true);
    this.errorMessage.set(null);

    if (!clientPackageId) {
      this.loading.set(false);
      this.errorMessage.set('Paquete no encontrado.');
      return of<ClientPackage | null>(null);
    }

    return this.api.getClientPackage(clientPackageId).pipe(
      catchError((error: unknown) => {
        this.errorMessage.set(mapPackageApiError(error, 'No pudimos cargar este paquete.'));
        return of<ClientPackage | null>(null);
      }),
      finalize(() => this.loading.set(false)),
    );
  }
}
