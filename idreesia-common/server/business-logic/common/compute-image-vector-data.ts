import * as cv from '@u4/opencv4nodejs';

import { ImageVectorStatus } from 'meteor/idreesia-common/constants';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';

import { detectFaces } from './face-detection';
import { alignFace, embedFace } from './face-recognition';

// Tags every computed/attempted vector with the pipeline that produced it, so a future model
// upgrade (a newer YuNet/SFace release, or a fix to the ported alignment math) doesn't silently
// mix incomparable embeddings - a consumer can tell an old vector apart from a new one.
//
// The `+umeyama-fix` suffix marks the alignment correction in face-recognition.ts: the ported
// Umeyama estimate was combining U with V instead of V-transpose, so no face was ever actually
// aligned. Vectors produced before that are not comparable with vectors produced after it - on a
// measured sample, correct-match recall went from 5.6% to 96.7% - which is exactly what this field
// exists to express. backfillImageVectorData() recomputes anything not on the current version.
const MODEL_VERSION = 'yunet-2023mar+sface-2021dec+umeyama-fix';

export { MODEL_VERSION };

// Matches security-server's MonitoringProfileService quality gate (detection candidacy threshold
// and hard-reject minimum face size). idreesia-erp has no human-in-the-loop confirmation step at
// profile-image-set time, so there is no separate "marginal quality" status - anything at or above
// this size with a single detected face is computed and stored as-is.
const DETECTION_SCORE_THRESHOLD = 0.6;
const HARD_REJECT_MIN_PX = 40;

export interface ImageVectorData {
  vector?: number[];
  status: string;
  computedAt: Date;
  modelVersion: string;
}

// Shared by the enrollment path below and by face search, which embeds a throwaway probe photo
// that is deliberately never stored as an Attachment. Both therefore apply exactly the same
// quality gate, so a photo that can't enrol also can't be searched with - and reports why.
export function computeVectorFromImageBuffer(buffer: Buffer): ImageVectorData {
  const computedAt = new Date();

  try {
    const image = cv.imdecode(buffer);
    const faces = detectFaces(image, DETECTION_SCORE_THRESHOLD);

    if (faces.length === 0) {
      return { status: ImageVectorStatus.NO_FACE, computedAt, modelVersion: MODEL_VERSION };
    }
    if (faces.length > 1) {
      return { status: ImageVectorStatus.MULTIPLE_FACES, computedAt, modelVersion: MODEL_VERSION };
    }

    const [face] = faces;
    const minDimension = Math.min(face.box.width, face.box.height);
    if (minDimension < HARD_REJECT_MIN_PX) {
      return { status: ImageVectorStatus.TOO_SMALL, computedAt, modelVersion: MODEL_VERSION };
    }

    const aligned = alignFace(image, face.landmarks);
    const vector = embedFace(aligned);

    return { vector, status: ImageVectorStatus.COMPUTED, computedAt, modelVersion: MODEL_VERSION };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('computeVectorFromImageBuffer failed:', error);
    return { status: ImageVectorStatus.ERROR, computedAt, modelVersion: MODEL_VERSION };
  }
}

export async function computeImageVectorData(attachmentId: string): Promise<ImageVectorData> {
  try {
    const attachment = await Attachments.findOneAsync(attachmentId);
    if (!attachment || !attachment.mimeType.startsWith('image/')) {
      return {
        status: ImageVectorStatus.ERROR,
        computedAt: new Date(),
        modelVersion: MODEL_VERSION,
      };
    }

    return computeVectorFromImageBuffer(Buffer.from(attachment.data, 'base64'));
  } catch (error) {
    // Callers store this result on the person rather than handling a throw - setSecurityVisitorImage
    // and setHrKarkunProfileImage both assign it straight into sharedData.imageVectorData.
    // eslint-disable-next-line no-console
    console.error(`computeImageVectorData failed for attachment ${attachmentId}:`, error);
    return {
      status: ImageVectorStatus.ERROR,
      computedAt: new Date(),
      modelVersion: MODEL_VERSION,
    };
  }
}
