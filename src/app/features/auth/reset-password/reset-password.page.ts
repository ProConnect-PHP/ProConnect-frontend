import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.css']
})
export class ResetPasswordPage implements OnInit {
  password = '';
  confirmPassword = '';
  token = '';
  email = '';

  errorMensaje = '';
  exitoMensaje = '';
  cargando = false; // Estado para controlar el spinner/botón

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    // Capturamos los datos que nos mandó el link del mail desde la URL
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || '';
      // decodeURIComponent transforma el "%40" de vuelta en un "@" limpio
      const rawEmail = params['email'] || '';
      this.email = decodeURIComponent(rawEmail);
    });
  }

  cambiarPassword(): void {
    this.errorMensaje = '';
    this.exitoMensaje = '';

    if (this.password !== this.confirmPassword) {
      this.errorMensaje = 'Las contraseñas no coinciden. Verificalas.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMensaje = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.cargando = true; // Deshabilitamos el botón para evitar doble click

    const datos = {
      token: this.token,
      email: this.email,
      password: this.password,
      password_confirmation: this.confirmPassword
    };

    this.http.post('http://localhost/api/v1/auth/password-update', datos)
      .subscribe({
        next: (response: any) => {
          this.cargando = false;
          localStorage.clear();
          sessionStorage.clear();

          // Usamos el mensaje exacto que viene del backend
          this.exitoMensaje = response.message || '¡Tu contraseña ha sido actualizada con éxito!';
          this.password = '';
          this.confirmPassword = '';

          // Esperamos 3 segundos para que veas el cartel antes de ir al login
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 3000);
        },
        error: (err) => {
          this.cargando = false;
          console.error(err);
          // Captura el mensaje de error estructurado del backend (ej: Token inválido/expirado)
          this.errorMensaje = err.error?.message || 'Ocurrió un error interno. Intenta nuevamente más tarde.';
        }
      });
  }
}
