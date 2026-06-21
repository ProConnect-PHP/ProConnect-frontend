import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ProfessionalAgendaApi } from '../../data-access/professional-agenda.api';
import {
  ProfessionalAgendaEvent,
  ProfessionalAgendaResponse,
  ProfessionalAgendaSummary,
} from '../../data-access/professional-agenda.models';
import { ProfessionalAgendaPage } from './professional-agenda-page';

const rangeSummary: ProfessionalAgendaSummary = {
  total: 4,
  pending: 0,
  confirmed: 1,
  paid: 0,
  in_progress: 0,
  completed: 2,
  cancelled: 1,
  no_show: 0,
};

const globalSummary: ProfessionalAgendaSummary = {
  total: 99,
  pending: 8,
  confirmed: 20,
  paid: 15,
  in_progress: 3,
  completed: 48,
  cancelled: 5,
  no_show: 0,
};

function createEvent(
  overrides: Partial<ProfessionalAgendaEvent> = {},
): ProfessionalAgendaEvent {
  return {
    id: 1,
    type: 'booking',
    title: 'Consulta inicial',
    starts_at: '2026-06-20 10:00:00',
    ends_at: '2026-06-20 11:00:00',
    status: 'completed',
    modality: 'remote',
    service: null,
    client: { id: 1, name: 'Ana', avatar_url: null },
    payment_status: 'paid',
    payment_source: 'payment',
    client_package: null,
    package_session: null,
    video_session: null,
    flags: {
      is_cancelled: false,
      is_pending: false,
      is_confirmed: false,
      is_paid: false,
      is_completed: true,
      is_no_show: false,
      has_video_session: true,
      uses_package: false,
    },
    created_at: '2026-06-01 10:00:00',
    ...overrides,
  };
}

function createResponse(
  overrides: Partial<ProfessionalAgendaResponse> = {},
): ProfessionalAgendaResponse {
  return {
    timezone: 'America/Montevideo',
    view: 'month',
    range: {
      from: '2026-06-01 00:00:00',
      to: '2026-06-30 23:59:59',
    },
    events: [createEvent()],
    summary: rangeSummary,
    range_summary: rangeSummary,
    global_summary: globalSummary,
    ...overrides,
  };
}

describe('ProfessionalAgendaPage', () => {
  let component: ProfessionalAgendaPage;
  let fixture: ComponentFixture<ProfessionalAgendaPage>;
  let api: { getProfessionalAgenda: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    api = {
      getProfessionalAgenda: vi.fn().mockReturnValue(of(createResponse())),
    };

    await TestBed.configureTestingModule({
      imports: [ProfessionalAgendaPage],
      providers: [
        provideRouter([]),
        { provide: ProfessionalAgendaApi, useValue: api },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfessionalAgendaPage);
    component = fixture.componentInstance;
    component.visibleDate.set(new Date(2026, 5, 20));
    fixture.detectChanges();
  });

  it('loads the visible month through the month agenda contract', () => {
    expect(api.getProfessionalAgenda).toHaveBeenCalledWith({
      view: 'month',
      date: '2026-06-20',
    });
  });

  it('renders the month title and separates global from range summaries', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Junio 2026');
    expect(host.textContent).toContain('Total histórico');
    expect(host.textContent).toContain('99');
    expect(host.textContent).toContain('4 reservas en este mes');
  });

  it('loads the previous and next months', () => {
    component.previousMonth();

    expect(api.getProfessionalAgenda).toHaveBeenLastCalledWith({
      view: 'month',
      date: '2026-05-01',
    });

    component.nextMonth();

    expect(api.getProfessionalAgenda).toHaveBeenLastCalledWith({
      view: 'month',
      date: '2026-06-01',
    });
  });

  it('returns to the current month from the today action', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 4, 12, 0, 0));

    component.goToday();

    expect(api.getProfessionalAgenda).toHaveBeenLastCalledWith({
      view: 'month',
      date: '2026-08-04',
    });

    vi.useRealTimers();
  });

  it('groups visible events by day and filters them locally by status', () => {
    component.agenda.set(
      createResponse({
        events: [
          createEvent({ id: 1, status: 'completed' }),
          createEvent({
            id: 2,
            starts_at: '2026-06-20 11:00:00',
            status: 'cancelled',
            flags: {
              ...createEvent().flags,
              is_cancelled: true,
              is_completed: false,
            },
          }),
        ],
      }),
    );

    expect(component.eventsForDay(component.days()[19]).length).toBe(2);

    component.setStatus('completed');

    expect(component.eventsForDay(component.days()[19]).map((event) => event.id)).toEqual([1]);
    expect(api.getProfessionalAgenda).toHaveBeenCalledTimes(1);
  });

  it('renders completed and cancelled event badges', () => {
    component.agenda.set(
      createResponse({
        events: [
          createEvent({ status: 'completed' }),
          createEvent({
            id: 2,
            status: 'cancelled',
            flags: {
              ...createEvent().flags,
              is_cancelled: true,
              is_completed: false,
            },
          }),
        ],
      }),
    );
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Finalizada');
    expect(host.textContent).toContain('Cancelada');
  });
});
