import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { AppLoadingSpinnerComponent } from '../../../../shared/ui/loading-spinner/loading-spinner.component';
import { AdminUsersTableComponent } from '../../components/admin-users-table/admin-users-table.component';
import { AdminUsersService } from '../../data-access/admin-users.service';
import { AdminPaginationMeta } from '../../models/admin-pagination.model';
import { AdminUser, AdminUserRole, AdminUserStatus } from '../../models/admin-user.model';
import { adminErrorMessage } from '../../utils/admin-error.util';

const initialMeta: AdminPaginationMeta = {
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
};

@Component({
  selector: 'app-admin-users-page',
  host: {
    class: 'block w-full min-w-0',
  },
  imports: [
    ReactiveFormsModule,
    AppAlertComponent,
    AppEmptyStateComponent,
    AppLoadingSpinnerComponent,
    AdminUsersTableComponent,
  ],
  templateUrl: './admin-users-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUsersPageComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly usersService = inject(AdminUsersService);
  private readonly destroyRef = inject(DestroyRef);

  readonly filtersForm = this.fb.group({
    search: [''],
    role: this.fb.control<AdminUserRole | ''>(''),
    status: this.fb.control<AdminUserStatus | ''>(''),
  });

  readonly users = signal<AdminUser[]>([]);
  readonly meta = signal<AdminPaginationMeta>(initialMeta);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly updatingUserId = signal<string | null>(null);
  readonly perPage = 10;

  readonly canGoPrevious = computed(() => this.meta().current_page > 1 && !this.loading());
  readonly canGoNext = computed(() => this.meta().current_page < this.meta().last_page && !this.loading());

  ngOnInit(): void {
    this.loadUsers();
  }

  applyFilters(): void {
    this.loadUsers(1);
  }

  clearFilters(): void {
    this.filtersForm.reset({ search: '', role: '', status: '' });
    this.loadUsers(1);
  }

  loadUsers(page = this.meta().current_page): void {
    const filters = this.filtersForm.getRawValue();

    this.loading.set(true);
    this.errorMessage.set(null);

    this.usersService
      .getUsers({
        ...filters,
        page,
        per_page: this.perPage,
      })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.users.set(response.data);
          this.meta.set(response.meta);
        },
        error: (error: unknown) =>
          this.errorMessage.set(adminErrorMessage(error, 'No pudimos cargar los usuarios.')),
      });
  }

  previousPage(): void {
    if (!this.canGoPrevious()) return;
    this.loadUsers(this.meta().current_page - 1);
  }

  nextPage(): void {
    if (!this.canGoNext()) return;
    this.loadUsers(this.meta().current_page + 1);
  }

  confirmStatusChange(event: { user: AdminUser; status: AdminUserStatus }): void {
    const action = event.status === 'disabled' ? 'deshabilitar' : 'activar';
    const confirmed =
      typeof window === 'undefined' ||
      window.confirm(`Confirmas ${action} a ${event.user.email}?`);

    if (!confirmed) return;

    this.updatingUserId.set(event.user.id);
    this.errorMessage.set(null);

    this.usersService
      .updateUserStatus(event.user.id, event.status)
      .pipe(
        finalize(() => this.updatingUserId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.loadUsers(this.meta().current_page),
        error: (error: unknown) =>
          this.errorMessage.set(adminErrorMessage(error, 'No pudimos actualizar el usuario.')),
      });
  }
}
