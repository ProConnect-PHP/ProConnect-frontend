import {
  unwrapPaginatedVideoSessionsResponse,
  unwrapVideoSessionJoinResponse,
  unwrapVideoSessionResponse,
} from './video-sessions.mapper';

describe('video sessions mapper', () => {
  it('unwraps direct video session responses', () => {
    const videoSession = unwrapVideoSessionResponse({
      video_session: {
        id: 'session-1',
        booking_id: 'booking-1',
        client_id: 'client-1',
        professional_id: 'professional-1',
        provider: 'simulator',
        status: 'open',
        room_name: 'room-1',
        can_join_now: true,
        created_at: '2026-06-05 10:00:00',
      },
    });

    expect(videoSession.id).toBe('session-1');
    expect(videoSession.provider).toBe('simulator');
    expect(videoSession.can_join_now).toBe(true);
  });

  it('unwraps ApiResponse join responses', () => {
    const join = unwrapVideoSessionJoinResponse({
      success: true,
      data: {
        join: {
          video_session_id: 'session-1',
          provider: 'simulator',
          room_name: 'room-1',
          access_token: 'secret-token',
          participant: {
            id: 'participant-1',
            video_session_id: 'session-1',
            user_id: 'user-1',
            role: 'client',
            join_count: 1,
          },
        },
      },
    });

    expect(join.video_session_id).toBe('session-1');
    expect(join.access_token).toBe('secret-token');
    expect(join.participant.role).toBe('client');
  });

  it('unwraps paginated video session responses', () => {
    const response = unwrapPaginatedVideoSessionsResponse({
      success: true,
      data: {
        video_sessions: [
          {
            id: 'session-1',
            booking_id: 'booking-1',
            provider: 'simulator',
            status: 'scheduled',
            room_name: 'room-1',
            can_join_now: false,
          },
        ],
        meta: {
          current_page: 1,
          per_page: 10,
          total: 1,
          last_page: 1,
        },
      },
    });

    expect(response.video_sessions).toHaveLength(1);
    expect(response.video_sessions[0].booking_id).toBe('booking-1');
    expect(response.meta.total).toBe(1);
  });
});
