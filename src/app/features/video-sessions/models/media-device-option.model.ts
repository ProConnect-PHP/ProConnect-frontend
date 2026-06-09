export type MediaDeviceKindOption = 'audioinput' | 'videoinput';

export interface MediaDeviceOption {
  deviceId: string;
  groupId: string;
  kind: MediaDeviceKindOption;
  label: string;
  isDefault: boolean;
}
