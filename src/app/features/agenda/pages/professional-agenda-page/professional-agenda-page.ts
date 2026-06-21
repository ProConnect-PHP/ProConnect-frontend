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
import { AgendaEventCardComponent } from '../../components/agenda-event-card/agenda-event-card.component';
import { AgendaSummaryCardsComponent } from '../../components/agenda-summary-cards/agenda-summary-cards.component';
import { AgendaToolbarComponent } from '../../components/agenda-toolbar/agenda-toolbar.component';
import { ProfessionalAgendaApi } from '../../data-access/professional-agenda.api';
import {
  AgendaStatusFilter,
  ProfessionalAgendaEvent,
  ProfessionalAgendaResponse,
  ProfessionalAgendaSummary,
} from '../../data-access/professional-agenda.models';
import {
  AgendaDay,
  addMonths,
  buildMonthDays,
  dateKeyFromIso,
  formatAgendaMonthTitle,
  toDateInputValue,
} from '../../utils/agenda-date.util';

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
    AgendaToolbarComponent,
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
  readonly visibleDate = signal(new Date());
  readonly activeStatus = signal<AgendaStatusFilter>('all');

  readonly days = computed<AgendaDay[]>(() => buildMonthDays(this.visibleDate()));
  readonly monthTitle = computed(() => formatAgendaMonthTitle(this.visibleDate()));
  readonly globalSummary = computed(
    () => this.agenda()?.global_summary ?? this.agenda()?.summary ?? emptySummary,
  );
  readonly rangeSummary = computed(
    () => this.agenda()?.range_summary ?? this.agenda()?.summary ?? emptySummary,
  );
  readonly events = computed(() => this.agenda()?.events ?? []);
  readonly filteredEvents = computed(() => {
    const status = this.activeStatus();
    const events = this.events();

    return status === 'all' ? events : events.filter((event) => event.status === status);
  });

  readonly eventsByDay = computed(() => {
    const map = new Map<string, ProfessionalAgendaEvent[]>();

    for (const event of this.filteredEvents()) {
      const key = dateKeyFromIso(event.starts_at);
      const currentEvents = map.get(key) ?? [];

      currentEvents.push(event);
      map.set(key, currentEvents);
    }

    for (const [key, events] of map.entries()) {
      map.set(key, [...events].sort((first, second) => first.starts_at.localeCompare(second.starts_at)));
    }

    return map;
  });

  readonly mobileDays = computed(() => {
    const eventsByDay = this.eventsByDay();

    return this.days().filter(
      (day) => !day.isOutsideMonth && (eventsByDay.get(day.key)?.length ?? 0) > 0,
    );
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

  previousMonth(): void {
    this.visibleDate.update((date) => addMonths(date, -1));
    this.loadAgenda();
  }

  nextMonth(): void {
    this.visibleDate.update((date) => addMonths(date, 1));
    this.loadAgenda();
  }

  goToday(): void {
    this.visibleDate.set(new Date());
    this.loadAgenda();
  }

  setStatus(status: AgendaStatusFilter): void {
    if (this.activeStatus() === status) return;

    this.activeStatus.set(status);
  }

  eventsForDay(day: AgendaDay): ProfessionalAgendaEvent[] {
    return this.eventsByDay().get(day.key) ?? [];
  }

  loadAgenda(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.api
      .getProfessionalAgenda({
        view: 'month',
        date: toDateInputValue(this.visibleDate()),
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
