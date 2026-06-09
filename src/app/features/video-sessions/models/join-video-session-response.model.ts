export interface JoinVideoSessionData {
  url: string;
  token: string;
  roomName: string;
  participantIdentity: string;
  participantName: string;
}

export interface JoinVideoSessionResponse {
  data: JoinVideoSessionData;
}
