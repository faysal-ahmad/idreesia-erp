export { detectFaces } from './face-detection';
export type { DetectedFace } from './face-detection';
export { alignFace, embedFace, cosineSimilarity } from './face-recognition';
export {
  computeImageVectorData,
  computeVectorFromImageBuffer,
} from './compute-image-vector-data';
export type { ImageVectorData } from './compute-image-vector-data';
export {
  searchPeopleByFaceVector,
  PEOPLE_IMAGE_VECTOR_SEARCH_INDEX,
} from './search-people-by-face-vector';
export type { FaceMatch } from './search-people-by-face-vector';
export { backfillImageVectorData } from './backfill-image-vector-data';
