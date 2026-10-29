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
  // Face checks before matching; null = the security server's default, 0 = off.
  minFaceSizePx?: number | null;
  minFaceQuality?: number | null;
  connection: ChannelConnectionValues;
}

export interface ProfileValues {
  name: string;
  isTest: boolean;
}

export interface AlertFaceQuality {
  // 0-100.
  score: number;
  // Why the score is low, e.g. 'Face turned away'.
  reasons: string[];
}

export interface AlertPayload {
  // The security server's own ids (the ERP records' externalId).
  profileId: string;
  channelId: string;
  timestamp: Date;
  similarityScore: number;
  // The matched face's shorter side (camera pixels) and quality; null on alerts
  // raised before the security server checked faces.
  faceSizePx: number | null;
  faceQuality: AlertFaceQuality | null;
  // Only needed the first time an alert is pushed.
  image: SyncImage | null;
}
