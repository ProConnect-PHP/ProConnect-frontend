import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppLoadingSpinnerComponent } from '../../../../shared/ui/loading-spinner/loading-spinner.component';
import { AdminMetricCardComponent } from '../../components/admin-metric-card/admin-metric-card.component';
import { AdminMetricsService } from '../../data-access/admin-metrics.service';
import { AdminMetrics } from '../../models/admin-metrics.model';
import { adminErrorMessage } from '../../utils/admin-error.util';

type MetricItem = {
  label: string;
  value: string;
  description: string;
};

@Component({
  selector: 'app-admin-dashboard-page',
  host: {
    class: 'block w-full min-w-0',
  },
  imports: [AppAlertComponent, AppLoadingSpinnerComponent, AdminMetricCardComponent],
  templateUrl: './admin-dashboard-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardPageComponent implements OnInit {
  private readonly metricsService = inject(AdminMetricsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly numberFormatter = new Intl.NumberFormat('es-UY');

  readonly metrics = signal<AdminMetrics | null>(null);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly metricItems = computed<MetricItem[]>(() => {
    const metrics = this.metrics();
    if (!metrics) return [];

    const items: MetricItem[] = [
      this.metric('Usuarios totales', metrics.users_total, 'Cuentas registradas'),
      this.metric('Clientes', metrics.clients_total, 'Usuarios con rol cliente'),
      this.metric('Profesionales', metrics.professionals_total, 'Prestadores registrados'),
      this.metric('Administradores', metrics.admins_total, 'Cuentas con acceso admin'),
      this.metric('Reservas totales', metrics.bookings_total, 'Historial completo'),
      this.metric('Reservas de hoy', metrics.bookings_today, 'Actividad del dia'),
      this.metric('Servicios', metrics.services_total, 'Servicios publicados'),
    ];

    if (metrics.reviews_total !== undefined) {
      items.push(this.metric('Resenas', metrics.reviews_total, 'Opiniones registradas'));
    }

    if (metrics.packages_total !== undefined) {
      items.push(this.metric('Paquetes', metrics.packages_total, 'Productos de paquetes'));
    }

    if (metrics.payments_total !== undefined) {
      items.push(this.metric('Pagos', metrics.payments_total, 'Pagos registrados'));
    }

    return items;
  });

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.metricsService
      .getMetrics()
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (metrics) => this.metrics.set(metrics),
        error: (error: unknown) =>
          this.errorMessage.set(
            adminErrorMessage(error, 'No pudimos cargar las metricas administrativas.'),
          ),
      });
  }

  private metric(label: string, value: number, description: string): MetricItem {
    return {
      label,
      value: this.numberFormatter.format(value),
      description,
    };
  }
}
