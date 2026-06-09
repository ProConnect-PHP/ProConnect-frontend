import { TestBed } from '@angular/core/testing';

import { VideoSessionsApi } from '../../data-access/video-sessions.api';
import { VideoSession } from '../../data-access/video-sessions.models';
import { VideoJoinPanelComponent } from './video-join-panel.component';

const videoSession: VideoSession = {
  id: 'session-1',
  booking_id: 'booking-1',
  client_id: 'client-1',
  professional_id: 'professional-1',
  provider: 'simulator',
  status: 'scheduled',
  room_name: 'room-1',
  join_url: null,
  scheduled_start_at: '2026-06-05 14:00:00',
  scheduled_end_at: '2026-06-05 15:00:00',
  opened_at: null,
  started_at: null,
  ended_at: null,
  cancelled_at: null,
  expired_at: null,
  can_join_now: false,
  created_at: '2026-06-04 11:00:00',
};

describe('VideoJoinPanelComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoJoinPanelComponent],
      providers: [{ provide: VideoSessionsApi, useValue: {} }],
    }).compileComponents();
  });

  it('shows simulator notice and disables join outside the window', () => {
    const fixture = TestBed.createComponent(VideoJoinPanelComponent);
    fixture.componentRef.setInput('videoSession', videoSession);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    const button = host.querySelector('button');

    expect(host.textContent).toContain('No se iniciara una videollamada real');
    expect(button?.disabled).toBe(true);
  });
});
