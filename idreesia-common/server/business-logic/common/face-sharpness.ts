import * as cv from '@u4/opencv4nodejs';

// Blur measure ported from security-server's FaceQualityService: the variance of the Laplacian on
// the aligned grayscale face crop, mapped on a log scale since it spans orders of magnitude
// between a smeared and a crisp face.
const MIN_VARIANCE = 30;
const MAX_VARIANCE = 600;

/** 0 to 100: 100 is crisp, 0 is smeared. `aligned` is the 112x112 aligned face crop. */
export function faceSharpnessScore(aligned: cv.Mat): number {
  const gray = aligned.bgrToGray();
  try {
    const laplacian = gray.laplacian(cv.CV_64F);
    const { mean, stddev } = laplacian.meanStdDev();
    const variance = stddev.at(0, 0) ** 2;
    laplacian.release();
    mean.release();
    stddev.release();
    if (variance <= 0) return 0;
    const ratio =
      (Math.log10(variance) - Math.log10(MIN_VARIANCE)) /
      (Math.log10(MAX_VARIANCE) - Math.log10(MIN_VARIANCE));
    return Math.round(Math.min(Math.max(ratio, 0), 1) * 100);
  } finally {
    gray.release();
  }
}
