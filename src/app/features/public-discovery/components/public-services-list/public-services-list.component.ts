import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { PublicService } from '../../models/public-discovery.models';
import { PublicServiceCardComponent } from '../public-service-card/public-service-card.component';
import { PublicServiceSkeletonComponent } from '../public-service-skeleton/public-service-skeleton.component';
import { PublicServicesEmptyStateComponent } from '../public-services-empty-state/public-services-empty-state.component';

@Component({
  selector: 'app-public-services-list',
  imports: [
    PublicServiceCardComponent,
    PublicServiceSkeletonComponent,
    PublicServicesEmptyStateComponent,
  ],
  template: `
    @if (loading()) {
      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-live="polite">
        @for (item of skeletonItems; track item) {
          <app-public-service-skeleton />
        }
      </div>
    } @else if (services().length === 0) {
      <app-public-services-empty-state (clearFilters)="clearFilters.emit()" />
    } @else {
      <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        @for (service of services(); track service.id) {
          <app-public-service-card [service]="service" />
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicServicesListComponent {
  readonly services = input<PublicService[]>([]);
  readonly loading = input(false);
  readonly clearFilters = output<void>();

  readonly skeletonItems = Array.from({ length: 6 }, (_value, index) => index);
}
