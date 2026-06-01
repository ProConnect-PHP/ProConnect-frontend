import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ApiClientError } from '../../../core/http/models/api-error.model';
import { AppCardComponent } from '../../../shared/ui/card/card.component';
import { AppPageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { ServiceFormComponent } from '../components/service-form/service-form.component';
import { ServicesApi } from '../data-access/services.api';
import { StoreServiceRequest } from '../models/service.models';

@Component({
  selector: 'app-service-create-page',
  imports: [AppCardComponent, AppPageHeaderComponent, ServiceFormComponent],
  templateUrl: './service-create-page.component.html',
  styleUrl: './service-create-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceCreatePageComponent {
  private readonly servicesApi = inject(ServicesApi);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  createService(payload: StoreServiceRequest): void {
    this.errorMessage.set(null);
    this.isSaving.set(true);

    this.servicesApi
      .create(payload)
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
    return 'No pudimos crear el servicio.';
  }
}
