import { ImageVectorStatus } from 'meteor/idreesia-common/constants';

import { computeVectorFromImageBuffer } from './compute-image-vector-data';
import { getPersonImageUrls } from './person-images';
import { searchPeopleByFaceVector } from './search-people-by-face-vector';

// A few candidates, because the best overall match may be a visitor or an
// employee while a karkun sits just below it.
const CANDIDATE_LIMIT = 5;

export interface KarkunFaceMatch {
  personId: string;
  name: string | null;
  imageUrl: string | null;
}

export interface FindKarkunByFaceImageResult {
  // 'computed' when the photo was usable (whether or not anyone matched);
  // otherwise the reason it was not, so the caller can ask for a retake.
  status: string;
  match: KarkunFaceMatch | null;
}

// The capture control sends a canvas data URL; tolerate it with or without the prefix.
const stripDataUrlPrefix = (imageData: string) =>
  imageData.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

/**
 * Finds the karkun whose stored photo best matches the face in `imageData`.
 * Only the name and photo are returned, as this backs the public attendance
 * kiosk.
 */
export async function findKarkunByFaceImage(
  imageData: string
): Promise<FindKarkunByFaceImageResult> {
  const { vector, status } = computeVectorFromImageBuffer(
    Buffer.from(stripDataUrlPrefix(imageData), 'base64'),
    // The kiosk is in a public place: people walk by behind whoever is using it.
    { useLargestFace: true }
  );
  if (status !== ImageVectorStatus.COMPUTED || !vector) {
    return { status: status ?? ImageVectorStatus.ERROR, match: null };
  }

  // Ordered best first.
  const matches = await searchPeopleByFaceVector(vector, CANDIDATE_LIMIT);
  const best = matches.find(({ person }) => person.isKarkun);
  if (!best) return { status: ImageVectorStatus.COMPUTED, match: null };

  return {
    status: ImageVectorStatus.COMPUTED,
    match: {
      personId: best.person._id,
      name: best.person.sharedData?.name ?? null,
      imageUrl: getPersonImageUrls(best.person.sharedData).imageUrl,
    },
  };
}
