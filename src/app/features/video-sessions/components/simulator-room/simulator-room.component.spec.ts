import { TestBed } from '@angular/core/testing';

import { VideoSession, VideoSessionJoin } from '../../data-access/video-sessions.models';
import { SimulatorRoomComponent } from './simulator-room.component';

const videoSession: VideoSession = {
  id: 'session-1',
  booking_id: 'booking-1',
  client_id: 'client-1',
  professional_id: 'professional-1',
  provider: 'simulator',
  status: 'open',
  room_name: 'room-1',
  join_url: null,
  scheduled_start_at: '2026-06-05 14:00:00',
  scheduled_end_at: '2026-06-05 15:00:00',
  opened_at: null,
  started_at: null,
  ended_at: null,
  cancelled_at: null,
  expired_at: null,
  can_join_now: true,
  participants: [],
  created_at: '2026-06-04 11:00:00',
};

const join: VideoSessionJoin = {
  video_session_id: 'session-1',
  provider: 'simulator',
  room_name: 'room-1',
  join_url: null,
  access_token: 'secret-token',
  participant: {
    id: 'participant-1',
    video_session_id: 'session-1',
    user_id: 'client-1',
    role: 'client',
    provider_identity: 'client-1',
    display_name: 'Cliente Demo',
    first_joined_at: '2026-06-05 13:55:00',
    last_joined_at: '2026-06-05 13:55:00',
    left_at: null,
    join_count: 1,
    metadata: null,
    created_at: '2026-06-05 13:55:00',
  },
  expires_at: '2026-06-05 16:00:00',
};

describe('SimulatorRoomComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SimulatorRoomComponent],
    }).compileComponents();
  });

  it('renders simulator controls without exposing the access token', () => {
    const fixture = TestBed.createComponent(SimulatorRoomComponent);
    fixture.componentRef.setInput('videoSession', videoSession);
    fixture.componentRef.setInput('join', join);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;

    expect(host.textContent).toContain('Modo simulador');
    expect(host.textContent).toContain('Microfono activo');
    expect(host.textContent).not.toContain('secret-token');
  });
});
