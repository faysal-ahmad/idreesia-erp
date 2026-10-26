export interface SyncUser {
  _id: string;
}

export interface SyncImage {
  mimeType: string;
  data: Buffer;
}

export type AlertReview = 'CORRECT' | 'FALSE_POSITIVE';

export interface ChannelConnectionValues {
  host: string;
  port?: number | null;
  path?: string | null;
  username?: string | null;
  // Left empty on update to keep the stored password.
  password?: string | null;
}

export interface ChannelValues {
  name: string;
  enabled: boolean;
  similarityThreshold?: number | null;
  recognitionFps: number;
  connection: ChannelConnectionValues;
}

export interface ProfileValues {
  name: string;
  isTest: boolean;
}

export interface AlertPayload {
  // The security server's own ids (the ERP records' externalId).
  profileId: string;
  channelId: string;
  timestamp: Date;
  similarityScore: number;
  // Only needed the first time an alert is pushed.
  image: SyncImage | null;
}
