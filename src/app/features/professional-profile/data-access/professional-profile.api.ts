import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiClient } from '../../../core/http/api.client';
import {
  ProfessionalProfileResponse,
  StoreProfessionalProfileRequest,
} from '../models/professional-profile.models';

@Injectable({ providedIn: 'root' })
export class ProfessionalProfileApi {
  private readonly api = inject(ApiClient);

  show(): Observable<ProfessionalProfileResponse> {
    return this.api.get<ProfessionalProfileResponse>('professional-profile');
  }

  create(payload: StoreProfessionalProfileRequest): Observable<ProfessionalProfileResponse> {
    return this.api.post<ProfessionalProfileResponse, StoreProfessionalProfileRequest>(
      'professional-profile',
      payload,
    );
  }

  update(payload: StoreProfessionalProfileRequest): Observable<ProfessionalProfileResponse> {
    return this.api.put<ProfessionalProfileResponse, StoreProfessionalProfileRequest>(
      'professional-profile',
      payload,
    );
  }
}
