import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { ApiClient } from '../../../core/http/api.client';
import {
  BookingId,
  PaginatedVideoSessions,
  VideoSession,
  VideoSessionId,
  VideoSessionJoin,
  VideoSessionsListParams,
} from './video-sessions.models';
import {
  unwrapPaginatedVideoSessionsResponse,
  unwrapVideoSessionJoinResponse,
  unwrapVideoSessionResponse,
} from './video-sessions.mapper';

@Injectable({ providedIn: 'root' })
export class VideoSessionsApi {
  private readonly api = inject(ApiClient);

  getBookingVideoSession(bookingId: BookingId): Observable<VideoSession> {
    return this.api
      .get<unknown>(`bookings/${bookingId}/video-session`)
      .pipe(map((response) => unwrapVideoSessionResponse(response)));
  }

  ensureBookingVideoSession(bookingId: BookingId): Observable<VideoSession> {
    return this.api
      .post<unknown, Record<string, never>>(`bookings/${bookingId}/video-session`, {})
      .pipe(map((response) => unwrapVideoSessionResponse(response)));
  }

  joinVideoSession(videoSessionId: VideoSessionId): Observable<VideoSessionJoin> {
    return this.api
      .post<unknown, Record<string, never>>(`video-sessions/${videoSessionId}/join`, {})
      .pipe(map((response) => unwrapVideoSessionJoinResponse(response)));
  }

  listMyVideoSessions(params: VideoSessionsListParams = {}): Observable<PaginatedVideoSessions> {
    return this.api
      .get<unknown>('video-sessions/my', { params: this.toApiParams(params) })
      .pipe(map((response) => unwrapPaginatedVideoSessionsResponse(response)));
  }

  listProfessionalVideoSessions(
    params: VideoSessionsListParams = {},
  ): Observable<PaginatedVideoSessions> {
    return this.api
      .get<unknown>('professional/video-sessions', { params: this.toApiParams(params) })
      .pipe(map((response) => unwrapPaginatedVideoSessionsResponse(response)));
  }

  private toApiParams(params: VideoSessionsListParams): Record<string, number | undefined> {
    return {
      page: params.page,
      per_page: params.per_page,
    };
  }
}
