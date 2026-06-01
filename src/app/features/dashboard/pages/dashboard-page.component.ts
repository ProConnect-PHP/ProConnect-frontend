import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import { AuthStore } from '../../../core/auth/services/auth.store';
import { ApiClientError } from '../../../core/http/models/api-error.model';
import { ProfessionalProfileApi } from '../../professional-profile/data-access/professional-profile.api';
import { ProfessionalProfile } from '../../professional-profile/models/professional-profile.models';
import { ServicesApi } from '../../services/data-access/services.api';
import { Service } from '../../services/models/service.models';
import { AppBadgeComponent } from '../../../shared/ui/badge/badge.component';
import { AppCardComponent } from '../../../shared/ui/card/card.component';
import { AppEmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { AppLoadingSpinnerComponent } from '../../../shared/ui/loading-spinner/loading-spinner.component';
import { AppPageHeaderComponent } from '../../../shared/ui/page-header/page-header.component';
import { formatMoney } from '../../../shared/utils/money.util';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    RouterLink,
    AppBadgeComponent,
    AppCardComponent,
    AppEmptyStateComponent,
    AppLoadingSpinnerComponent,
    AppPageHeaderComponent,
  ],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly profileApi = inject(ProfessionalProfileApi);
  private readonly servicesApi = inject(ServicesApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly isLoading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly profile = signal<ProfessionalProfile | null>(null);
  readonly services = signal<Service[]>([]);
  readonly userName = computed(() => this.authStore.currentUser()?.name ?? 'profesional');
  readonly activeServices = computed(() => this.services().filter((service) => service.is_active).length);

  ngOnInit(): void {
    forkJoin({
      profile: this.profileApi.show().pipe(
        map((response) => response.professional_profile),
        catchError((error: unknown) => {
          if (error instanceof ApiClientError && error.status === 404) return of(null);
          return of(null);
        }),
      ),
      services: this.servicesApi.mine().pipe(
        map((response) => response.services),
        catchError(() => of([])),
      ),
    })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ profile, services }) => {
          this.profile.set(profile);
          this.services.set(services);
        },
        error: (error: unknown) => this.errorMessage.set(this.errorFrom(error)),
      });
  }

  money(value: string | number): string {
    return formatMoney(value);
  }

  private errorFrom(error: unknown): string {
    if (error instanceof ApiClientError) return error.message;
    return 'No pudimos cargar el dashboard.';
  }
}
