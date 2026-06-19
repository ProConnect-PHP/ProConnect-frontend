import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppLoadingSpinnerComponent } from '../../../../shared/ui/loading-spinner/loading-spinner.component';
import { AdminUsersService } from '../../data-access/admin-users.service';
import { AdminUser, AdminUserStatus } from '../../models/admin-user.model';
import { adminErrorMessage } from '../../utils/admin-error.util';

@Component({
  selector: 'app-admin-user-detail-page',
  host: {
    class: 'block w-full min-w-0',
  },
  imports: [RouterLink, AppAlertComponent, AppLoadingSpinnerComponent],
  templateUrl: './admin-user-detail-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly usersService = inject(AdminUsersService);
  private readonly destroyRef = inject(DestroyRef);

  readonly user = signal<AdminUser | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly nextStatus = computed<AdminUserStatus>(() =>
    this.user()?.status === 'disabled' ? 'active' : 'disabled',
  );

  readonly actionLabel = computed(() => {
    if (this.saving()) return 'Guardando...';
    return this.nextStatus() === 'disabled' ? 'Deshabilitar usuario' : 'Activar usuario';
  });

  ngOnInit(): void {
    this.loadUser();
  }

  loadUser(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (!userId) {
      this.errorMessage.set('No encontramos el identificador del usuario.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.usersService
      .getUser(userId)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (user) => this.user.set(user),
        error: (error: unknown) =>
          this.errorMessage.set(adminErrorMessage(error, 'No pudimos cargar el usuario.')),
      });
  }

  changeStatus(): void {
    const user = this.user();
    if (!user) return;

    const nextStatus = this.nextStatus();
    const action = nextStatus === 'disabled' ? 'deshabilitar' : 'activar';
    const confirmed =
      typeof window === 'undefined' || window.confirm(`Confirmas ${action} a ${user.email}?`);

    if (!confirmed) return;

    this.saving.set(true);
    this.errorMessage.set(null);

    this.usersService
      .updateUserStatus(user.id, nextStatus)
      .pipe(
        finalize(() => this.saving.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (updatedUser) => this.user.set(updatedUser),
        error: (error: unknown) =>
          this.errorMessage.set(adminErrorMessage(error, 'No pudimos actualizar el usuario.')),
      });
  }

  roleLabel(role: string): string {
    if (role === 'professional') return 'Profesional';
    if (role === 'admin') return 'Admin';
    return 'Cliente';
  }

  statusLabel(status: AdminUserStatus): string {
    return status === 'disabled' ? 'Deshabilitado' : 'Activo';
  }

  dateLabel(value: string | undefined): string {
    if (!value) return '-';
    return new Intl.DateTimeFormat('es-UY', { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(value),
    );
  }
}
