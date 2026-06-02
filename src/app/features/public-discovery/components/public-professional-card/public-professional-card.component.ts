import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PublicProfessional } from '../../models/public-discovery.models';
import { PublicRatingBadgeComponent } from '../public-rating-badge/public-rating-badge.component';

@Component({
  selector: 'app-public-professional-card',
  imports: [RouterLink, PublicRatingBadgeComponent],
  template: `
    @if (professional(); as profile) {
      <article class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div class="flex items-start gap-3">
          @if (profile.user?.avatar_url) {
            <img
              class="size-12 rounded-full object-cover"
              [src]="profile.user?.avatar_url"
              [alt]="'Avatar de ' + professionalName(profile)"
            />
          } @else {
            <div
              class="grid size-12 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white"
              aria-hidden="true"
            >
              {{ professionalInitial(profile) }}
            </div>
          }

          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <a
                class="font-semibold text-slate-950 hover:text-indigo-700 focus:outline focus:outline-2 focus:outline-indigo-600"
                [routerLink]="['/professionals', profile.id]"
              >
                {{ professionalName(profile) }}
              </a>
              @if (profile.is_verified) {
                <span class="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800">
                  Verificado
                </span>
              }
            </div>

            <p class="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
              {{ profile.bio || 'Profesional disponible en ProConnect.' }}
            </p>

            <div class="mt-3">
              <app-public-rating-badge
                [rating]="profile.avg_rating"
                [reviewsCount]="profile.reviews_count"
              />
            </div>
          </div>
        </div>
      </article>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicProfessionalCardComponent {
  readonly professional = input<PublicProfessional | null | undefined>(null);

  professionalName(profile: PublicProfessional): string {
    return profile.user?.name ?? 'Profesional de ProConnect';
  }

  professionalInitial(profile: PublicProfessional): string {
    return this.professionalName(profile).trim().slice(0, 1).toUpperCase() || 'P';
  }
}
