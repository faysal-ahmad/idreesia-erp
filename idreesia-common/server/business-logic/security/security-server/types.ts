export interface SyncUser {
  _id: string;
}

export interface SyncImage {
  mimeType: string;
  data: Buffer;
}

export type AlertReview = 'CORRECT' | 'FALSE_POSITIVE';

export interface ChannelPayload {
  name: string;
  enabled: boolean;
  similarityThreshold: number | null;
  recognitionFps: number;
}

export interface ProfileImagePayload {
  id: string;
  // Only needed for images the ERP doesn't have yet; images it already holds
  // are matched by id and never re-uploaded.
  image: SyncImage | null;
}

export interface ProfilePayload {
  name: string;
  isTest: boolean;
  createdAt: Date | null;
  updatedAt: Date | null;
  images: ProfileImagePayload[];
}

export interface AlertPayload {
  profileId: string;
  channelId: string;
  timestamp: Date;
  similarityScore: number;
  review: AlertReview | null;
  reviewedAt: Date | null;
  // Only needed the first time an alert is pushed.
  image: SyncImage | null;
}

export interface AlertReviewPayload {
  review: AlertReview | null;
  reviewedAt: Date | null;
}
