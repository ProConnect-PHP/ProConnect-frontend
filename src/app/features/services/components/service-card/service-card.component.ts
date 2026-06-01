import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AppBadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { formatMoney } from '../../../../shared/utils/money.util';
import { Service } from '../../models/service.models';

@Component({
  selector: 'app-service-card',
  imports: [RouterLink, AppBadgeComponent],
  templateUrl: './service-card.component.html',
  styleUrl: './service-card.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceCardComponent {
  readonly service = input.required<Service>();
  readonly remove = output<Service>();

  money(value: string | number): string {
    return formatMoney(value);
  }
}
