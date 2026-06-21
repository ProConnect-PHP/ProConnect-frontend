import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../core/http/api.client';

import {
  ProfessionalAgendaMonthQuery,
  ProfessionalAgendaResponse,
} from './professional-agenda.models';

@Injectable({
  providedIn: 'root',
})
export class ProfessionalAgendaApi {
  private readonly api = inject(ApiClient);

  getProfessionalAgenda(
    query: ProfessionalAgendaMonthQuery,
  ): Observable<ProfessionalAgendaResponse> {
    return this.api.get<ProfessionalAgendaResponse>('/professional/agenda', {
      params: {
        view: query.view,
        date: query.date,
      },
    });
  }
}
