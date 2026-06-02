import { Component, input } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PublicProfessional, PublicService } from '../../models/public-discovery.models';
import { formatPrice } from '../../utils/price-format.util';
import { PublicCompanyBadgeComponent } from '../public-company-badge/public-company-badge.component';
import { PublicModalityBadgeComponent } from '../public-modality-badge/public-modality-badge.component';


@Component({
  selector: 'app-public-service-card',
  imports: [
    RouterLink,
    PublicCompanyBadgeComponent,
    PublicModalityBadgeComponent,
  ],
  templateUrl: './public-service-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicServiceCardComponent {
  readonly service = input.required<PublicService>();

  price(value: string | number): string {
    return formatPrice(value);
  }

  professionalName(professional: PublicProfessional | null | undefined): string {
    return professional?.user?.name ?? 'Profesional de ProConnect';
  }

  professionalInitial(professional: PublicProfessional | null | undefined): string {
    return this.professionalName(professional).trim().slice(0, 1).toUpperCase() || 'P';
  }

  descriptionPreview(service: PublicService): string {
    const description = service.description?.trim();
    if (!description) return 'Servicio profesional con disponibilidad publica.';
    return description.length > 150 ? `${description.slice(0, 147)}...` : description;
  }

  showLocation(service: PublicService): boolean {
    return service.modality !== 'remota' && !!service.address;
  }
}
