import { isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { AppAlertComponent } from '../../../../shared/ui/alert/alert.component';
import { AppLoadingSpinnerComponent } from '../../../../shared/ui/loading-spinner/loading-spinner.component';
import { SimulatorRoomComponent } from '../../components/simulator-room/simulator-room.component';
import { VideoJoinPanelComponent } from '../../components/video-join-panel/video-join-panel.component';
import { VideoSessionsApi } from '../../data-access/video-sessions.api';
import { mapVideoSessionApiError } from '../../data-access/video-sessions-error.mapper';
import { createSessionFromJoin } from '../../data-access/video-sessions.mapper';
import { VideoSession, VideoSessionJoin } from '../../data-access/video-sessions.models';

type RoomNavigationState = {
  videoSession?: VideoSession;
  join?: VideoSessionJoin;
};

type UnknownRecord = Record<string, unknown>;

@Component({
  selector: 'app-video-session-room-page',
  imports: [
    RouterLink,
    AppAlertComponent,
    AppLoadingSpinnerComponent,
    SimulatorRoomComponent,
    VideoJoinPanelComponent,
  ],
  templateUrl: './video-session-room-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoSessionRoomPageComponent implements OnInit {
  private readonly api = inject(VideoSessionsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly videoSession = signal<VideoSession | null>(null);
  readonly join = signal<VideoSessionJoin | null>(null);
  readonly joining = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const videoSessionId = this.route.snapshot.paramMap.get('videoSessionId');
    if (!videoSessionId) {
      this.errorMessage.set('Sesion virtual no encontrada.');
      return;
    }

    const state = this.readNavigationState();
    if (state.videoSession?.id === videoSessionId) {
      this.videoSession.set(state.videoSession);
    }

    if (state.join?.video_session_id === videoSessionId) {
      this.join.set(state.join);
      if (!this.videoSession()) {
        this.videoSession.set(createSessionFromJoin(state.join));
      }
      return;
    }

    this.joinById(videoSessionId);
  }

  onJoined(join: VideoSessionJoin): void {
    this.join.set(join);
    if (!this.videoSession()) {
      this.videoSession.set(createSessionFromJoin(join));
    }
  }

  leaveRoom(): void {
    const videoSession = this.videoSession();
    const bookingId = videoSession?.booking_id;

    if (bookingId) {
      const role = this.join()?.participant.role;
      const route = role === 'professional' ? '/professional/bookings' : '/my-bookings';
      void this.router.navigate([route, bookingId]);
      return;
    }

    void this.router.navigate(['/video-sessions/my']);
  }

  retryJoin(): void {
    const videoSessionId = this.route.snapshot.paramMap.get('videoSessionId');
    if (!videoSessionId) return;
    this.joinById(videoSessionId);
  }

  private joinById(videoSessionId: string): void {
    if (this.joining()) return;

    this.errorMessage.set(null);
    this.joining.set(true);

    this.api
      .joinVideoSession(videoSessionId)
      .pipe(
        finalize(() => this.joining.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (join) => {
          this.join.set(join);
          if (!this.videoSession()) {
            this.videoSession.set(createSessionFromJoin(join));
          }
        },
        error: (error: unknown) =>
          this.errorMessage.set(mapVideoSessionApiError(error, 'No pudimos entrar a la sala.')),
      });
  }

  private readNavigationState(): RoomNavigationState {
    const currentState = this.router.getCurrentNavigation()?.extras.state;
    const browserState = isPlatformBrowser(this.platformId) ? window.history.state : null;
    const state = this.coerceNavigationState(currentState ?? browserState);

    return state;
  }

  private coerceNavigationState(value: unknown): RoomNavigationState {
    if (!isRecord(value)) return {};

    return {
      videoSession: isVideoSession(value['videoSession']) ? value['videoSession'] : undefined,
      join: isVideoSessionJoin(value['join']) ? value['join'] : undefined,
    };
  }
}

function isVideoSession(value: unknown): value is VideoSession {
  return isRecord(value) && typeof value['id'] === 'string';
}

function isVideoSessionJoin(value: unknown): value is VideoSessionJoin {
  return isRecord(value) && typeof value['video_session_id'] === 'string';
}

function isRecord(value: unknown): value is UnknownRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
