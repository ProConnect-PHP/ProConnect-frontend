import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/http/api.client';
import {
  AvailabilitySlotsResponse,
  PublicProfessionalResponse,
  PublicServiceResponse,
  PublicServicesQuery,
  PublicServicesResponse,
} from '../models/public-discovery.models';
import { cleanPublicServicesQuery } from '../utils/public-service-query.util';

@Injectable({ providedIn: 'root' })
export class PublicDiscoveryApi {
  private readonly api = inject(ApiClient);

  listServices(query: PublicServicesQuery = {}): Observable<PublicServicesResponse> {
    return this.api.get<PublicServicesResponse>('public/services', {
      params: cleanPublicServicesQuery(query),
    });
  }

  showService(serviceId: string | number): Observable<PublicServiceResponse> {
    return this.api.get<PublicServiceResponse>(`public/services/${serviceId}`);
  }

  showProfessional(professionalId: string): Observable<PublicProfessionalResponse> {
    return this.api.get<PublicProfessionalResponse>(`public/professionals/${professionalId}`);
  }

  getAvailabilitySlots(
    serviceId: string | number,
    date: string,
  ): Observable<AvailabilitySlotsResponse> {
    return this.api.get<AvailabilitySlotsResponse>(`services/${serviceId}/availability`, {
      params: { date },
    });
  }
}
