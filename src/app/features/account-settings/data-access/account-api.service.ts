import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../core/http/api.client';

@Injectable({
  providedIn: 'root'
})
export class AccountApiService {
  private readonly api = inject(ApiClient);


  getProfile(): Observable<any> {
    return this.api.get(`me`);
  }

  updateProfile(payload: any): Observable<any> {
    return this.api.put(`me`, payload);
  }

  sendPasswordResetEmail(email: string): Observable<any> {
    return this.api.post(`auth/account/password-reset`, { email });
  }
}
