import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { AppLoadingSpinnerComponent } from '../../../../shared/ui/loading-spinner/loading-spinner.component';
import { AdminActivityLogTableComponent } from '../../components/admin-activity-log-table/admin-activity-log-table.component';
import { AdminActivityLogsService } from '../../data-access/admin-activity-logs.service';
import { ActivityLog } from '../../models/activity-log.model';
import { AdminPaginationMeta } from '../../models/admin-pagination.model';
import { adminErrorMessage } from '../../utils/admin-error.util';

const initialMeta: AdminPaginationMeta = {
  current_page: 1,
  per_page: 20,
  total: 0,
  last_page: 1,
};

@Component({
  selector: 'app-admin-activity-logs-page',
  host: {
    class: 'block w-full min-w-0',
  },
  imports: [
    ReactiveFormsModule,
    AppAlertComponent,
    AppEmptyStateComponent,
    AppLoadingSpinnerComponent,
    AdminActivityLogTableComponent,
  ],
  templateUrl: './admin-activity-logs-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminActivityLogsPageComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly logsService = inject(AdminActivityLogsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly filtersForm = this.fb.group({
    event: [''],
    severity: [''],
    actor_role: [''],
    acting_as: [''],
    date_from: [''],
    date_to: [''],
  });

  readonly logs = signal<ActivityLog[]>([]);
  readonly meta = signal<AdminPaginationMeta>(initialMeta);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly perPage = 20;

  readonly canGoPrevious = computed(() => this.meta().current_page > 1 && !this.loading());
  readonly canGoNext = computed(() => this.meta().current_page < this.meta().last_page && !this.loading());

  ngOnInit(): void {
    this.loadLogs();
  }

  applyFilters(): void {
    this.loadLogs(1);
  }

  clearFilters(): void {
    this.filtersForm.reset({
      event: '',
      severity: '',
      actor_role: '',
      acting_as: '',
      date_from: '',
      date_to: '',
    });
    this.loadLogs(1);
  }

  loadLogs(page = this.meta().current_page): void {
    const filters = this.filtersForm.getRawValue();

    this.loading.set(true);
    this.errorMessage.set(null);

    this.logsService
      .getLogs({
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
          this.logs.set(response.data);
          this.meta.set(response.meta);
        },
        error: (error: unknown) =>
          this.errorMessage.set(adminErrorMessage(error, 'No pudimos cargar los activity logs.')),
      });
  }

  previousPage(): void {
    if (!this.canGoPrevious()) return;
    this.loadLogs(this.meta().current_page - 1);
  }

  nextPage(): void {
    if (!this.canGoNext()) return;
    this.loadLogs(this.meta().current_page + 1);
  }
}
