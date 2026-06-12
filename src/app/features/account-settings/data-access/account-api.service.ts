import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from '../../../core/http/api.client';

@Injectable({
  providedIn: 'root'
})
export class AccountApiService {
  private readonly api = inject(ApiClient);

  // Obtiene los datos del usuario en sesión
  getProfile(): Observable<any> {
    return this.api.get(`me`);
  }

  // Actualiza los datos del usuario en sesión
  updateProfile(payload: any): Observable<any> {
    return this.api.put(`me`, payload);
  }

  // 🎯 Envía la solicitud de restablecimiento al endpoint público y correcto
  sendPasswordResetEmail(email: string): Observable<any> {
    // 1. Agregamos 'auth/' al principio para que machee con tu routes/api.php
    // 2. Removemos el tercer parámetro para evitar conflictos de firmas y tipos
    return this.api.post(`auth/account/password-reset`, { email });
  }
}
