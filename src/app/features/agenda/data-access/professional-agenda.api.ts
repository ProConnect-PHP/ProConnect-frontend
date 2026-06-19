import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../core/http/api.client';

import {
  ProfessionalAgendaQuery,
  ProfessionalAgendaResponse,
} from './professional-agenda.models';

@Injectable({
  providedIn: 'root',
})
export class ProfessionalAgendaApi {
  private readonly api = inject(ApiClient);

  list(query: ProfessionalAgendaQuery): Observable<ProfessionalAgendaResponse> {
    return this.api.get<ProfessionalAgendaResponse>('/professional/agenda', {
      params: {
        from: query.from,
        to: query.to,
        status: query.status,
        service_id: query.service_id,
      },
    });
  }
}
