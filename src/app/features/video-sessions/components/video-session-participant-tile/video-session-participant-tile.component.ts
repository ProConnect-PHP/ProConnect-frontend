import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  input,
  signal,
} from '@angular/core';
import {
  ParticipantEvent,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Track,
} from 'livekit-client';

@Component({
  selector: 'app-video-session-participant-tile',
  templateUrl: './video-session-participant-tile.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoSessionParticipantTileComponent
  implements AfterViewInit, OnDestroy
{
  readonly participant = input.required<RemoteParticipant>();

  @ViewChild('videoContainer', { static: true })
  private readonly videoContainer?: ElementRef<HTMLDivElement>;

  @ViewChild('audioContainer', { static: true })
  private readonly audioContainer?: ElementRef<HTMLDivElement>;

  readonly hasVideo = signal(false);
  readonly cameraEnabled = signal(false);
  readonly microphoneEnabled = signal(false);

  private readonly attachedElements = new Map<string, HTMLMediaElement[]>();

  private readonly handleTrackSubscribed = (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
  ) => {
    this.attachTrack(track, publication.trackSid);
    this.syncMediaState();
  };

  private readonly handleTrackUnsubscribed = (
    track: RemoteTrack,
    publication: RemoteTrackPublication,
  ) => {
    this.detachTrack(track, publication.trackSid);
    this.syncMediaState();
  };

  private readonly handleMediaStateChanged = () => this.syncMediaState();

  ngAfterViewInit(): void {
    this.attachExistingTracks();

    const participant = this.participant();
    participant.on(ParticipantEvent.TrackSubscribed, this.handleTrackSubscribed);
    participant.on(ParticipantEvent.TrackUnsubscribed, this.handleTrackUnsubscribed);
    participant.on(ParticipantEvent.TrackMuted, this.handleMediaStateChanged);
    participant.on(ParticipantEvent.TrackUnmuted, this.handleMediaStateChanged);
    participant.on(ParticipantEvent.TrackPublished, this.handleMediaStateChanged);
    participant.on(ParticipantEvent.TrackUnpublished, this.handleMediaStateChanged);

    this.syncMediaState();
  }

  ngOnDestroy(): void {
    const participant = this.participant();
    participant.off(ParticipantEvent.TrackSubscribed, this.handleTrackSubscribed);
    participant.off(ParticipantEvent.TrackUnsubscribed, this.handleTrackUnsubscribed);
    participant.off(ParticipantEvent.TrackMuted, this.handleMediaStateChanged);
    participant.off(ParticipantEvent.TrackUnmuted, this.handleMediaStateChanged);
    participant.off(ParticipantEvent.TrackPublished, this.handleMediaStateChanged);
    participant.off(ParticipantEvent.TrackUnpublished, this.handleMediaStateChanged);

    for (const publication of participant.trackPublications.values()) {
      const elements = publication.track?.detach() ?? [];
      this.removeElements(elements);
    }

    for (const elements of this.attachedElements.values()) {
      this.removeElements(elements);
    }
    this.attachedElements.clear();
  }

  displayName(): string {
    return this.participant().name || this.participant().identity;
  }

  initial(): string {
    return this.displayName().slice(0, 1).toUpperCase() || 'P';
  }

  private attachExistingTracks(): void {
    for (const publication of this.participant().trackPublications.values()) {
      if (publication.track) {
        this.attachTrack(publication.track, publication.trackSid);
      }
    }
  }

  private attachTrack(track: RemoteTrack, trackSid: string): void {
    if (this.attachedElements.has(trackSid)) return;

    const element = track.attach();
    if (track.kind === Track.Kind.Video) {
      element.classList.add('h-full', 'w-full', 'object-cover');
      this.videoContainer?.nativeElement.appendChild(element);
    } else if (track.kind === Track.Kind.Audio) {
      element.classList.add('hidden');
      this.audioContainer?.nativeElement.appendChild(element);
    }

    this.attachedElements.set(trackSid, [element]);
  }

  private detachTrack(track: RemoteTrack, trackSid: string): void {
    const elements = track.detach();
    this.removeElements(elements);
    this.removeElements(this.attachedElements.get(trackSid) ?? []);
    this.attachedElements.delete(trackSid);
  }

  private syncMediaState(): void {
    const participant = this.participant();
    this.cameraEnabled.set(participant.isCameraEnabled);
    this.microphoneEnabled.set(participant.isMicrophoneEnabled);
    this.hasVideo.set(
      Array.from(participant.videoTrackPublications.values()).some(
        (publication) => !!publication.videoTrack && !publication.isMuted,
      ),
    );
  }

  private removeElements(elements: HTMLMediaElement[]): void {
    for (const element of elements) element.remove();
  }
}
