import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppLoadingSpinnerComponent } from '../../../../shared/ui/loading-spinner/loading-spinner.component';
import { VideoSessionCardComponent } from '../../components/video-session-card/video-session-card.component';
import { VideoSessionEmptyStateComponent } from '../../components/video-session-empty-state/video-session-empty-state.component';
import { VideoSessionsApi } from '../../data-access/video-sessions.api';
import { mapVideoSessionApiError } from '../../data-access/video-sessions-error.mapper';
import {
  VideoSession,
  VideoSessionsPaginationMeta,
  VideoSessionStatus,
} from '../../data-access/video-sessions.models';

type VideoSessionFilter = 'all' | VideoSessionStatus;

const initialMeta: VideoSessionsPaginationMeta = {
  current_page: 1,
  per_page: 10,
  total: 0,
  last_page: 1,
};

@Component({
  selector: 'app-my-video-sessions-page',
  imports: [
    RouterLink,
    AppAlertComponent,
    AppLoadingSpinnerComponent,
    VideoSessionCardComponent,
    VideoSessionEmptyStateComponent,
  ],
  templateUrl: './my-video-sessions-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyVideoSessionsPageComponent implements OnInit {
  private readonly api = inject(VideoSessionsApi);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly videoSessions = signal<VideoSession[]>([]);
  readonly meta = signal<VideoSessionsPaginationMeta>(initialMeta);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly activeFilter = signal<VideoSessionFilter>('all');
  readonly page = signal(1);
  readonly perPage = 10;

  readonly filters: { label: string; value: VideoSessionFilter }[] = [
    { label: 'Todas', value: 'all' },
    { label: 'Programadas', value: 'scheduled' },
    { label: 'Disponibles', value: 'open' },
    { label: 'En curso', value: 'in_progress' },
    { label: 'Finalizadas', value: 'ended' },
  ];

  readonly filteredVideoSessions = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'all') return this.videoSessions();
    return this.videoSessions().filter((session) => session.status === filter);
  });

  readonly canGoPrevious = computed(() => this.page() > 1);
  readonly canGoNext = computed(() => this.page() < this.meta().last_page);

  ngOnInit(): void {
    this.loadVideoSessions();
  }

  loadVideoSessions(page = this.page()): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.page.set(page);

    this.api
      .listMyVideoSessions({ page, per_page: this.perPage })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.videoSessions.set(response.video_sessions);
          this.meta.set(response.meta);
          this.page.set(response.meta.current_page);
        },
        error: (error: unknown) =>
          this.errorMessage.set(
            mapVideoSessionApiError(error, 'No pudimos cargar tus sesiones virtuales.'),
          ),
      });
  }

  setFilter(filter: VideoSessionFilter): void {
    this.activeFilter.set(filter);
  }

  joinSession(videoSession: VideoSession): void {
    void this.router.navigate(['/video-sessions', videoSession.id, 'room'], {
      state: { videoSession },
    });
  }

  viewBooking(videoSession: VideoSession): void {
    void this.router.navigate(['/my-bookings', videoSession.booking_id]);
  }

  previousPage(): void {
    if (!this.canGoPrevious()) return;
    this.loadVideoSessions(this.page() - 1);
  }

  nextPage(): void {
    if (!this.canGoNext()) return;
    this.loadVideoSessions(this.page() + 1);
  }

  filterClasses(filter: VideoSessionFilter): string {
    const base =
      'min-h-10 rounded-md px-4 py-2 text-sm font-bold transition focus:outline focus:outline-2 focus:outline-indigo-600';
    return this.activeFilter() === filter
      ? `${base} bg-slate-950 text-white`
      : `${base} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`;
  }
}
