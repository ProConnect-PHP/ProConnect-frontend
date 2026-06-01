import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/http/api.client';
import { ServiceResponse, ServicesResponse, StoreServiceRequest } from '../models/service.models';

@Injectable({ providedIn: 'root' })
export class ServicesApi {
  private readonly api = inject(ApiClient);

  mine(): Observable<ServicesResponse> {
    return this.api.get<ServicesResponse>('services/my');
  }

  show(id: string | number): Observable<ServiceResponse> {
    return this.api.get<ServiceResponse>(`services/${id}`);
  }

  create(payload: StoreServiceRequest): Observable<ServiceResponse> {
    return this.api.post<ServiceResponse, StoreServiceRequest>('services', payload);
  }

  update(id: string | number, payload: Partial<StoreServiceRequest>): Observable<ServiceResponse> {
    return this.api.put<ServiceResponse, Partial<StoreServiceRequest>>(`services/${id}`, payload);
  }

  delete(id: string | number): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`services/${id}`);
  }
}
