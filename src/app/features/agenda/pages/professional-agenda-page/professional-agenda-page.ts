import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs/operators';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppLoadingSpinnerComponent } from '../../../../shared/ui/loading-spinner/loading-spinner.component';
import { ProfessionalAgendaApi } from '../../data-access/professional-agenda.api';
import {
  AgendaStatusFilter,
  ProfessionalAgendaEvent,
  ProfessionalAgendaResponse,
  ProfessionalAgendaSummary,
} from '../../data-access/professional-agenda.models';
import {
  AgendaDay,
  addDays,
  buildWeekDays,
  dateKeyFromIso,
  formatAgendaRangeTitle,
  startOfWeek,
  toDateInputValue,
} from '../../utils/agenda-date.util';
import { AgendaEventCardComponent } from "../../components/agenda-event-card/agenda-event-card.component";
import { AgendaSummaryCardsComponent } from "../../components/agenda-summary-cards/agenda-summary-cards.component";
import { AgendaToolbarComponent } from "../../components/agenda-toolbar/agenda-toolbar.component";

const emptySummary: ProfessionalAgendaSummary = {
  total: 0,
  pending: 0,
  confirmed: 0,
  paid: 0,
  in_progress: 0,
  completed: 0,
  cancelled: 0,
  no_show: 0,
};

@Component({
  selector: 'app-professional-agenda-page',
  imports: [
    AppAlertComponent,
    AppLoadingSpinnerComponent,
    AgendaEventCardComponent,
    AgendaSummaryCardsComponent,
    AgendaToolbarComponent
],
  templateUrl: './professional-agenda-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfessionalAgendaPage implements OnInit {
  private readonly api = inject(ProfessionalAgendaApi);
  private readonly destroyRef = inject(DestroyRef);

  readonly agenda = signal<ProfessionalAgendaResponse | null>(null);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly referenceDate = signal(new Date());
  readonly activeStatus = signal<AgendaStatusFilter>('all');

  readonly days = computed<AgendaDay[]>(() => buildWeekDays(this.referenceDate()));
  readonly weekTitle = computed(() => formatAgendaRangeTitle(this.referenceDate()));
  readonly summary = computed(() => this.agenda()?.summary ?? emptySummary);
  readonly events = computed(() => this.agenda()?.events ?? []);

  readonly eventsByDay = computed(() => {
    const map = new Map<string, ProfessionalAgendaEvent[]>();

    for (const day of this.days()) {
      map.set(day.key, []);
    }

    for (const event of this.events()) {
      const key = dateKeyFromIso(event.starts_at);
      const currentEvents = map.get(key) ?? [];

      currentEvents.push(event);
      map.set(key, currentEvents);
    }

    for (const [key, events] of map.entries()) {
      map.set(
        key,
        [...events].sort(
          (first, second) =>
            new Date(first.starts_at).getTime() - new Date(second.starts_at).getTime(),
        ),
      );
    }

    return map;
  });

  readonly statusFilters: { value: AgendaStatusFilter; label: string }[] = [
    { value: 'all', label: 'Todas' },
    { value: 'pending', label: 'Pendientes' },
    { value: 'confirmed', label: 'Confirmadas' },
    { value: 'paid', label: 'Pagadas' },
    { value: 'completed', label: 'Finalizadas' },
    { value: 'cancelled', label: 'Canceladas' },
    { value: 'no_show', label: 'No asistidas' },
  ];

  ngOnInit(): void {
    this.loadAgenda();
  }

  previousWeek(): void {
    this.referenceDate.update((date) => addDays(date, -7));
    this.loadAgenda();
  }

  nextWeek(): void {
    this.referenceDate.update((date) => addDays(date, 7));
    this.loadAgenda();
  }

  goToday(): void {
    this.referenceDate.set(new Date());
    this.loadAgenda();
  }

  setStatus(status: AgendaStatusFilter): void {
    if (this.activeStatus() === status) {
      return;
    }

    this.activeStatus.set(status);
    this.loadAgenda();
  }

  eventsForDay(day: AgendaDay): ProfessionalAgendaEvent[] {
    return this.eventsByDay().get(day.key) ?? [];
  }

  loadAgenda(): void {
    const weekStart = startOfWeek(this.referenceDate());
    const weekEnd = addDays(weekStart, 6);
    const status = this.activeStatus();

    this.loading.set(true);
    this.errorMessage.set(null);

    this.api
      .list({
        from: toDateInputValue(weekStart),
        to: toDateInputValue(weekEnd),
        status: status === 'all' ? undefined : status,
      })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.agenda.set(response),
        error: () => {
          this.agenda.set(null);
          this.errorMessage.set('No pudimos cargar tu agenda profesional.');
        },
      });
  }
}
