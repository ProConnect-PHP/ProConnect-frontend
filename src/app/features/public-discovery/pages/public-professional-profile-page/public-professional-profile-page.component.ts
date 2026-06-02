import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { of } from 'rxjs';
import { catchError, finalize, map, switchMap } from 'rxjs/operators';

import { ApiClientError } from '../../../../core/http/models/api-error.model';
import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { PublicRatingBadgeComponent } from '../../components/public-rating-badge/public-rating-badge.component';
import { PublicServiceCardComponent } from '../../components/public-service-card/public-service-card.component';
import { PublicDiscoveryApi } from '../../data-access/public-discovery.api';
import { PublicProfessional, PublicProfessionalResponse } from '../../models/public-discovery.models';

@Component({
  selector: 'app-public-professional-profile-page',
  imports: [RouterLink, AppEmptyStateComponent, PublicRatingBadgeComponent, PublicServiceCardComponent],
  templateUrl: './public-professional-profile-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicProfessionalProfilePageComponent implements OnInit {
  private readonly api = inject(PublicDiscoveryApi);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly professional = signal<PublicProfessional | null>(null);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly services = computed(() => this.professional()?.services?.filter((service) => service.is_active) ?? []);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => params.get('professionalId')),
        switchMap((professionalId) => this.fetchProfessional(professionalId)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => this.professional.set(response?.professional ?? null));
  }

  professionalName(professional: PublicProfessional): string {
    return professional.user?.name ?? 'Profesional de ProConnect';
  }

  professionalInitial(professional: PublicProfessional): string {
    return this.professionalName(professional).trim().slice(0, 1).toUpperCase() || 'P';
  }

  private fetchProfessional(professionalId: string | null) {
    this.loading.set(true);
    this.errorMessage.set(null);

    if (!professionalId) {
      this.loading.set(false);
      this.errorMessage.set('Profesional no encontrado.');
      return of<PublicProfessionalResponse | null>(null);
    }

    return this.api.showProfessional(professionalId).pipe(
      catchError((error: unknown) => {
        this.errorMessage.set(this.errorFrom(error));
        return of<PublicProfessionalResponse | null>(null);
      }),
      finalize(() => this.loading.set(false)),
    );
  }

  private errorFrom(error: unknown): string {
    if (error instanceof ApiClientError && error.status === 404) {
      return 'Profesional no encontrado.';
    }

    return 'No pudimos cargar el perfil profesional.';
  }
}
