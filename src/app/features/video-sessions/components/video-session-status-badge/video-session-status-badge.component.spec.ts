import { TestBed } from '@angular/core/testing';

import { VideoSessionStatusBadgeComponent } from './video-session-status-badge.component';

describe('VideoSessionStatusBadgeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideoSessionStatusBadgeComponent],
    }).compileComponents();
  });

  it('shows scheduled as Programada', () => {
    const fixture = TestBed.createComponent(VideoSessionStatusBadgeComponent);
    fixture.componentRef.setInput('status', 'scheduled');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Programada');
  });

  it('shows can join state before terminal labels', () => {
    const fixture = TestBed.createComponent(VideoSessionStatusBadgeComponent);
    fixture.componentRef.setInput('status', 'open');
    fixture.componentRef.setInput('canJoinNow', true);
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.textContent).toContain('Disponible para ingresar');
  });
});
