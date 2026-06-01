import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ApiClientError } from '../../../core/http/models/api-error.model';
import { AppAlertComponent } from '../../../shared/ui/alert/alert.component';
import { AppEmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { AppLoadingSpinnerComponent } from '../../../shared/ui/loading-spinner/loading-spinner.component';
import { AppPageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { ServiceCardComponent } from '../components/service-card/service-card.component';
import { ServicesApi } from '../data-access/services.api';
import { Service } from '../models/service.models';

@Component({
  selector: 'app-services-list-page',
  imports: [
    RouterLink,
    AppAlertComponent,
    AppEmptyStateComponent,
    AppLoadingSpinnerComponent,
    AppPageHeaderComponent,
    ServiceCardComponent,
  ],
  templateUrl: './services-list-page.component.html',
  styleUrl: './services-list-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesListPageComponent implements OnInit {
  private readonly servicesApi = inject(ServicesApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly services = signal<Service[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadServices();
  }

  deleteService(service: Service): void {
    const confirmed = confirm(`Eliminar "${service.name}"?`);
    if (!confirmed) return;

    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.servicesApi
      .delete(service.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.services.update((services) => services.filter((item) => item.id !== service.id));
          this.successMessage.set('Servicio eliminado correctamente.');
        },
        error: (error: unknown) => this.errorMessage.set(this.errorFrom(error)),
      });
  }

  private loadServices(): void {
    this.servicesApi
      .mine()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.services.set(response.services),
        error: (error: unknown) => this.errorMessage.set(this.errorFrom(error)),
      });
  }

  private errorFrom(error: unknown): string {
    if (error instanceof ApiClientError) return error.message;
    return 'No pudimos cargar los servicios.';
  }
}
