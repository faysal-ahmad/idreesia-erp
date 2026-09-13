import { People } from 'meteor/idreesia-common/server/collections/common';

// Shared with the migration that creates the index, so the two can never drift apart.
export const PEOPLE_IMAGE_VECTOR_SEARCH_INDEX = 'people_image_vector_index';

// SFace produces 128-d embeddings; see compute-image-vector-data.ts.
const VECTOR_DIMENSIONS = 128;

// Raw cosine similarity. Atlas does not report raw cosine though - $vectorSearch normalises it to
// (1 + cosine) / 2 - so comparisons are done in that normalised space and results are converted
// back before leaving this module, keeping this constant on SFace's own scale.
//
// Measured rather than taken from SFace's generic 0.363 reference: against a 578-person gallery,
// using same-CNIC duplicate records as known same-person pairs, genuine matches scored a median of
// 0.718 (5th percentile 0.539) while the best wrong candidate scored a median of 0.438 (highest
// seen 0.523). 0.50 sits in that gap and keeps 96.7% of genuine matches.
//
// Worth re-measuring against the full collection: the best impostor score creeps up with gallery
// size, and that sample was 578 people against a real population of ~38k. Genuine-match scores do
// not move with gallery size, so the risk of raising this is losing true matches, not gaining noise.
const RAW_COSINE_THRESHOLD = 0.5;
const MIN_SEARCH_SCORE = (1 + RAW_COSINE_THRESHOLD) / 2;

const toRawCosine = (score: number) => 2 * score - 1;

// Atlas guidance is 10-20x the requested limit, with a floor around 100. Over-fetching candidates
// costs little at this collection size and protects recall.
const NUM_CANDIDATES_MULTIPLIER = 40;
const MIN_NUM_CANDIDATES = 100;

export interface FaceMatch {
  person: Record<string, any>;
  score: number;
}

interface ScoredPerson {
  _id: string;
  score: number;
  [key: string]: unknown;
}

export async function searchPeopleByFaceVector(
  vector: number[],
  limit = 5
): Promise<FaceMatch[]> {
  // This vector arrives from the browser rather than being computed in the same call, so it is
  // untrusted input. A wrong-length or non-numeric array would otherwise reach $vectorSearch and
  // surface as a server error instead of an empty result.
  if (
    !Array.isArray(vector) ||
    vector.length !== VECTOR_DIMENSIONS ||
    !vector.every(value => typeof value === 'number' && Number.isFinite(value))
  ) {
    return [];
  }

  // A zero vector passes the checks above but has no direction, and Atlas rejects it outright
  // ("Cosine similarity cannot be calculated against a zero vector") rather than returning nothing.
  if (vector.every(value => value === 0)) {
    return [];
  }

  const results = await People.aggregate<ScoredPerson>([
    {
      // No `filter` is needed to exclude people without a usable face: only records whose status
      // is `computed` ever have a `vector` field, and documents missing the indexed path are not
      // indexed at all.
      $vectorSearch: {
        index: PEOPLE_IMAGE_VECTOR_SEARCH_INDEX,
        path: 'sharedData.imageVectorData.vector',
        queryVector: vector,
        numCandidates: Math.max(limit * NUM_CANDIDATES_MULTIPLIER, MIN_NUM_CANDIDATES),
        limit,
      },
    },
    {
      $addFields: {
        score: { $meta: 'vectorSearchScore' },
      },
    },
  ]);

  return results
    .filter(person => person.score >= MIN_SEARCH_SCORE)
    .map(({ score, ...person }) => ({
      person,
      score: toRawCosine(score),
    }));
}
