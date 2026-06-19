import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  SendEmailVerificationResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from '../models/auth.models';
import { ApiClient } from '../../http/api.client';

@Injectable({
  providedIn: 'root',
})
export class EmailVerificationApiService {
  private readonly api = inject(ApiClient);

  send(): Observable<SendEmailVerificationResponse> {
    return this.api.post<SendEmailVerificationResponse>('auth/email-verification/send', {});
  }

  verify(payload: VerifyEmailRequest): Observable<VerifyEmailResponse> {
    return this.api.post<VerifyEmailResponse>('auth/email-verification/verify', payload);
  }
}
