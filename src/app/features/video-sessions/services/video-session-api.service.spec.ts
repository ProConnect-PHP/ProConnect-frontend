import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';

import { ApiClient } from '../../../core/http/api.client';
import {
  VideoSessionApiService,
  mapJoinVideoSessionResponse,
} from './video-session-api.service';

describe('VideoSessionApiService', () => {
  it('requests a fresh LiveKit token for the booking', async () => {
    const response = {
      data: {
        url: 'wss://livekit.example.test',
        token: 'temporary-token',
        roomName: 'booking-42',
        participantIdentity: 'user-7',
        participantName: 'Jose',
      },
    };
    const post = vi.fn(() => of(response));

    TestBed.configureTestingModule({
      providers: [
        VideoSessionApiService,
        {
          provide: ApiClient,
          useValue: { post },
        },
      ],
    });

    const service = TestBed.inject(VideoSessionApiService);
    await expect(
      firstValueFrom(service.joinBookingVideoSession('booking-42')),
    ).resolves.toEqual(response);
    expect(post).toHaveBeenCalledWith(
      'video-sessions/bookings/booking-42/join',
      {},
    );
  });
});

describe('mapJoinVideoSessionResponse', () => {
  it('maps the LiveKit join contract', () => {
    expect(
      mapJoinVideoSessionResponse({
        data: {
          url: 'wss://livekit.example.test',
          token: 'temporary-token',
          roomName: 'booking-42',
          participantIdentity: 'user-7',
          participantName: 'Jose',
        },
      }),
    ).toEqual({
      data: {
        url: 'wss://livekit.example.test',
        token: 'temporary-token',
        roomName: 'booking-42',
        participantIdentity: 'user-7',
        participantName: 'Jose',
      },
    });
  });

  it('accepts the existing snake case response shape', () => {
    expect(
      mapJoinVideoSessionResponse({
        data: {
          join: {
            join_url: 'wss://livekit.example.test',
            access_token: 'temporary-token',
            room_name: 'booking-42',
            participant: {
              provider_identity: 'user-7',
              display_name: 'Jose',
            },
          },
        },
      }),
    ).toEqual({
      data: {
        url: 'wss://livekit.example.test',
        token: 'temporary-token',
        roomName: 'booking-42',
        participantIdentity: 'user-7',
        participantName: 'Jose',
      },
    });
  });

  it('rejects responses without connection credentials', () => {
    expect(() => mapJoinVideoSessionResponse({ data: {} })).toThrowError(
      'La respuesta de acceso a LiveKit no incluye url.',
    );
  });
});
