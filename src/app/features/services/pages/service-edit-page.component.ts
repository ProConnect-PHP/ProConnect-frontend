import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ApiClientError } from '../../../core/http/models/api-error.model';
import { AppAlertComponent } from '../../../shared/ui/alert/alert.component';
import { AppCardComponent } from '../../../shared/ui/card/card.component';
import { AppLoadingSpinnerComponent } from '../../../shared/ui/loading-spinner/loading-spinner.component';
import { AppPageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { ServiceFormComponent } from '../components/service-form/service-form.component';
import { ServicesApi } from '../data-access/services.api';
import { Service, StoreServiceRequest } from '../models/service.models';

@Component({
  selector: 'app-service-edit-page',
  imports: [
    AppAlertComponent,
    AppCardComponent,
    AppLoadingSpinnerComponent,
    AppPageHeaderComponent,
    ServiceFormComponent,
  ],
  templateUrl: './service-edit-page.component.html',
  styleUrl: './service-edit-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceEditPageComponent implements OnInit {
  private readonly servicesApi = inject(ServicesApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly service = signal<Service | null>(null);
  readonly isLoading = signal(true);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage.set('Servicio no encontrado.');
      this.isLoading.set(false);
      return;
    }

    this.servicesApi
      .show(id)
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.service.set(response.service),
        error: (error: unknown) => this.errorMessage.set(this.errorFrom(error)),
      });
  }

  updateService(payload: StoreServiceRequest): void {
    const service = this.service();
    if (!service) return;

    this.errorMessage.set(null);
    this.isSaving.set(true);

    this.servicesApi
      .update(service.id, payload)
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => void this.router.navigateByUrl('/dashboard/services'),
        error: (error: unknown) => this.errorMessage.set(this.errorFrom(error)),
      });
  }

  private errorFrom(error: unknown): string {
    if (error instanceof ApiClientError) return error.message;
    return 'No pudimos cargar el servicio.';
  }
}
