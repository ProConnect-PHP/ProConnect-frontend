import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppLoadingSpinnerComponent } from '../../../../shared/ui/loading-spinner/loading-spinner.component';
import { AppPageHeaderComponent } from '../../../../shared/ui/page-header/page-header.component';
import { AccountApiService } from '../../data-access/account-api.service';
import { ProfileFormComponent } from '../../components/profile-form/profile-form.component';

@Component({
  selector: 'app-account-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    AppAlertComponent,
    AppLoadingSpinnerComponent,
    AppPageHeaderComponent,
    ProfileFormComponent,
  ],
  templateUrl: './account-settings-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountSettingsPageComponent implements OnInit {
  private readonly accountApi = inject(AccountApiService);
  private readonly destroyRef = inject(DestroyRef);

  readonly userProfile = signal<any | null>(null);
  readonly loading = signal(true);
  readonly sendingEmail = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadProfile();
  }

  private loadProfile(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.accountApi.getProfile()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (data) => this.userProfile.set(data),
        error: () => this.errorMessage.set('No pudimos cargar tus datos de perfil.')
      });
  }

  onSaveProfile(updatedData: any): void {
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.accountApi.updateProfile(updatedData)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.successMessage.set('¡Tus cambios fueron guardados con éxito!');

          // 1. Recargamos localmente por consistencia
          this.loadProfile();

          // 2. Forzamos la actualización completa de la SPA. El Header se inicializa de nuevo,
          // va a buscar la sesión al backend y cambia el nombre en la interfaz al instante.
          window.location.reload();
        },
        error: () => this.errorMessage.set('Hubo un error al intentar actualizar tus datos.')
      });
  }

  onResetPasswordRequest(): void {
    // 1. Extraemos el perfil actual
    const profile = this.userProfile();

    // 2. Sacamos el email
    const userEmail = profile?.email || profile?.user?.email;

    if (!userEmail) {
      this.errorMessage.set('No se pudo determinar el correo electrónico de tu cuenta.');
      return;
    }

    const seguro = confirm(`¿Estás seguro de que querés cambiar tu contraseña? Te enviaremos un correo electrónico a ${userEmail} con un enlace seguro para restablecerla.`);
    if (!seguro) return;

    this.sendingEmail.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    // 3. Consumimos el método del servicio
    this.accountApi.sendPasswordResetEmail(userEmail)
      .pipe(
        finalize(() => this.sendingEmail.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.successMessage.set('¡Correo enviado con éxito! Revisá tu bandeja de entrada en Mailpit.');
        },
        error: (err) => {
          console.error('Error detallado capturado en el componente:', err);

          // Escudo por si el status de la red fue exitoso pero Angular lo interceptó raro
          if (err.status === 200 || err.status === 204) {
            this.successMessage.set('¡Correo enviado con éxito! Revisá tu bandeja de entrada en Mailpit.');
            return;
          }

          // EXTRACCIÓN MEJORADA: Busca el mensaje del backend dentro de la estructura del Interceptor
          const serverMessage = err.error?.message || err.error?.error?.message || err.message;

          // Si el mensaje sigue trayendo el prefijo nativo de HTTP, limpiamos o usamos el fallback
          const finalMessage = serverMessage && !serverMessage.includes('Http failure response')
            ? serverMessage
            : 'Por razones de seguridad, debes esperar un momento antes de solicitar otro enlace.';

          this.errorMessage.set(finalMessage);
        }
      });
  }
}
