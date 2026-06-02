import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';

import { ApiClientError } from '../../../../core/http/models/api-error.model';
import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppEmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { AppLoadingSpinnerComponent } from '../../../../shared/ui/loading-spinner/loading-spinner.component';
import { formatTimeRange, toDateInputValue } from '../../../../shared/utils/date.util';
import { PublicDiscoveryApi } from '../../data-access/public-discovery.api';
import { AvailabilitySlot } from '../../models/public-discovery.models';

@Component({
  selector: 'app-public-availability-preview',
  imports: [ReactiveFormsModule, AppAlertComponent, AppEmptyStateComponent, AppLoadingSpinnerComponent],
  templateUrl: './public-availability-preview.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicAvailabilityPreviewComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(PublicDiscoveryApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly serviceId = input.required<string | number>();
  readonly slots = signal<AvailabilitySlot[]>([]);
  readonly selectedSlot = signal<AvailabilitySlot | null>(null);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    date: [toDateInputValue(new Date()), [Validators.required]],
  });

  ngOnInit(): void {
    this.loadSlots();
  }

  loadSlots(): void {
    if (this.form.invalid) {
      this.errorMessage.set('Selecciona una fecha valida.');
      return;
    }

    this.selectedSlot.set(null);
    this.errorMessage.set(null);
    this.loading.set(true);

    this.api
      .getAvailabilitySlots(this.serviceId(), this.form.getRawValue().date)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.slots.set(response.slots),
        error: (error: unknown) => {
          this.slots.set([]);
          this.errorMessage.set(this.errorFrom(error));
        },
      });
  }

  selectSlot(slot: AvailabilitySlot): void {
    this.selectedSlot.set(slot);
  }

  slotLabel(slot: AvailabilitySlot): string {
    return formatTimeRange(slot.starts_at, slot.ends_at);
  }

  isSelected(slot: AvailabilitySlot): boolean {
    return this.selectedSlot()?.starts_at === slot.starts_at;
  }

  private errorFrom(error: unknown): string {
    if (error instanceof ApiClientError && error.status === 404) {
      return 'No pudimos encontrar disponibilidad para este servicio.';
    }

    return 'No pudimos consultar los horarios disponibles.';
  }
}
