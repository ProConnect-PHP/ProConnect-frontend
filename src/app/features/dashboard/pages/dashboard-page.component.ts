import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
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

type DashboardProfileResult = {
  profile: ProfessionalProfile | null;
  issue: string | null;
};

type DashboardServicesResult = {
  services: Service[];
  issue: string | null;
};

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

  readonly userName = computed(() => {
    return this.authStore.currentUser()?.name?.trim() || 'profesional';
  });

  readonly hasProfile = computed(() => {
    return this.profile() !== null;
  });

  readonly hasServices = computed(() => {
    return this.services().length > 0;
  });

  readonly activeServices = computed(() => {
    return this.services().filter((service) => service.is_active).length;
  });

  readonly inactiveServices = computed(() => {
    return this.services().filter((service) => !service.is_active).length;
  });

  readonly servicesPreview = computed(() => {
    return this.services().slice(0, 3);
  });

  readonly onboardingCompleted = computed(() => {
    return this.hasProfile() && this.hasServices();
  });

  readonly nextActionLabel = computed(() => {
    if (!this.hasProfile()) return 'Crear perfil profesional';
    if (!this.hasServices()) return 'Crear primer servicio';

    return 'Ver reservas recibidas';
  });

  readonly nextActionRoute = computed(() => {
    if (!this.hasProfile()) return '/dashboard/profile';
    if (!this.hasServices()) return '/dashboard/services/new';

    return '/professional/bookings';
  });

  readonly nextActionDescription = computed(() => {
    if (!this.hasProfile()) {
      return 'Completá tu perfil para poder operar como profesional dentro de la plataforma.';
    }

    if (!this.hasServices()) {
      return 'Publicá tu primer servicio para que los clientes puedan reservar turnos.';
    }

    return 'Tu configuración base está lista. El siguiente paso es gestionar reservas, disponibilidad y sesiones.';
  });

  readonly profileStatusLabel = computed(() => {
    return this.hasProfile() ? 'Activo' : 'Pendiente';
  });

  readonly profileStatusDescription = computed(() => {
    return this.hasProfile()
      ? 'Bio, rating y verificación configurados.'
      : 'Creá tu perfil para publicar servicios.';
  });

  readonly profileVerificationLabel = computed(() => {
    const professionalProfile = this.profile();

    if (!professionalProfile) return 'Sin perfil';

    return professionalProfile.is_verified ? 'Verificado' : 'Sin verificar';
  });

  readonly profileVerificationVariant = computed<'success' | 'warning' | 'neutral'>(() => {
    const professionalProfile = this.profile();

    if (!professionalProfile) return 'neutral';

    return professionalProfile.is_verified ? 'success' : 'warning';
  });

  ngOnInit(): void {
    this.loadDashboard();
  }

  money(value: string | number): string {
    return formatMoney(value);
  }

  serviceSummary(service: Service): string {
    return `${service.duration_minutes} min · ${service.modality} · ${this.money(service.price)}`;
  }

  reload(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      profileResult: this.loadProfile(),
      servicesResult: this.loadServices(),
    })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ profileResult, servicesResult }) => {
          this.profile.set(profileResult.profile);
          this.services.set(servicesResult.services);

          const issue = profileResult.issue ?? servicesResult.issue;

          if (issue) {
            this.errorMessage.set(issue);
          }
        },
        error: (error: unknown) => {
          this.profile.set(null);
          this.services.set([]);
          this.errorMessage.set(this.errorFrom(error));
        },
      });
  }

  private loadProfile() {
    return this.profileApi.show().pipe(
      map((response): DashboardProfileResult => {
        return {
          profile: response.professional_profile,
          issue: null,
        };
      }),
      catchError((error: unknown) => {
        if (error instanceof ApiClientError && error.status === 404) {
          return of({
            profile: null,
            issue: null,
          } satisfies DashboardProfileResult);
        }

        return of({
          profile: null,
          issue: this.errorFrom(error),
        } satisfies DashboardProfileResult);
      }),
    );
  }

  private loadServices() {
    return this.servicesApi.mine().pipe(
      map((response): DashboardServicesResult => {
        return {
          services: response.services,
          issue: null,
        };
      }),
      catchError((error: unknown) => {
        return of({
          services: [],
          issue: this.errorFrom(error),
        } satisfies DashboardServicesResult);
      }),
    );
  }

  private errorFrom(error: unknown): string {
    if (error instanceof ApiClientError) {
      return error.message || 'No pudimos cargar el dashboard.';
    }

    return 'No pudimos cargar el dashboard.';
  }
}
