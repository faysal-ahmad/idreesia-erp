import * as cv from '@u4/opencv4nodejs';

import { SFACE_MODEL_PATH } from './face-vector-model-paths';

// SFace's canonical alignment target - 5 reference points for a 112x112 crop, straight from
// OpenCV's FaceRecognizerSFImpl::getSimilarityTransformMatrix (modules/objdetect/src/face_recognize.cpp).
const DST_POINTS: [number, number][] = [
  [38.2946, 51.6963],
  [73.5318, 51.5014],
  [56.0252, 71.7366],
  [41.5493, 92.3655],
  [70.7299, 92.2041],
];
const DST_MEAN: [number, number] = [56.0262, 71.9008];

interface Svd2x2Result {
  s: [number, number];
  U: [[number, number], [number, number]];
  V: [[number, number], [number, number]];
}

// Closed-form SVD of a 2x2 matrix via eigendecomposition of A^T*A - @u4/opencv4nodejs doesn't
// expose cv::SVD, which OpenCV's own getSimilarityTransformMatrix relies on, so it's reimplemented
// here (verified numerically against synthetic cases, including negative-determinant and
// rank-deficient inputs, before relying on it for alignment).
function svd2x2(a: number, b: number, c: number, d: number): Svd2x2Result {
  const m11 = a * a + c * c;
  const m12 = a * b + c * d;
  const m22 = b * b + d * d;
  const tr = m11 + m22;
  const det = m11 * m22 - m12 * m12;
  const disc = Math.max((tr * tr) / 4 - det, 0);
  const sq = Math.sqrt(disc);
  const lambda1 = tr / 2 + sq;
  const lambda2 = Math.max(tr / 2 - sq, 0);

  const normalize = ([x, y]: [number, number]): [number, number] => {
    const n = Math.hypot(x, y);
    return n < 1e-12 ? [1, 0] : [x / n, y / n];
  };
  const eigenvector = (lambda: number): [number, number] => {
    if (Math.abs(m12) > 1e-12) return normalize([m12, lambda - m11]);
    return Math.abs(lambda - m11) < Math.abs(lambda - m22) ? [1, 0] : [0, 1];
  };

  const v1 = eigenvector(lambda1);
  const v2 = normalize([-v1[1], v1[0]]);
  const s1 = Math.sqrt(lambda1);
  const s2 = Math.sqrt(lambda2);

  const applyA = ([x, y]: [number, number]): [number, number] => [a * x + b * y, c * x + d * y];
  const uFor = (v: [number, number], s: number): [number, number] | null => {
    if (s < 1e-9) return null;
    const av = applyA(v);
    return [av[0] / s, av[1] / s];
  };

  let u1 = uFor(v1, s1);
  let u2 = uFor(v2, s2);
  if (!u1 && !u2) {
    u1 = [1, 0];
    u2 = [0, 1];
  } else if (!u2) {
    u2 = normalize([-u1![1], u1![0]]);
  } else if (!u1) {
    u1 = normalize([-u2[1], u2[0]]);
  }

  return {
    s: [s1, s2],
    U: [
      [u1![0], u2![0]],
      [u1![1], u2![1]],
    ],
    V: [
      [v1[0], v2[0]],
      [v1[1], v2[1]],
    ],
  };
}

function det2(m: [[number, number], [number, number]]): number {
  return m[0][0] * m[1][1] - m[0][1] * m[1][0];
}

// Ported from FaceRecognizerSFImpl::getSimilarityTransformMatrix - Umeyama similarity transform
// estimation (least-squares scale+rotation+translation) mapping detected 5-point landmarks onto
// SFace's canonical alignment target (verified numerically, sub-micron reconstruction error,
// against synthetic scale/rotation/translation cases before use).
function getSimilarityTransformMatrix(
  src: [number, number][]
): [[number, number, number], [number, number, number]] {
  const srcMean: [number, number] = [
    src.reduce((sum, p) => sum + p[0], 0) / 5,
    src.reduce((sum, p) => sum + p[1], 0) / 5,
  ];
  const srcDemean = src.map((p): [number, number] => [p[0] - srcMean[0], p[1] - srcMean[1]]);
  const dstDemean = DST_POINTS.map((p): [number, number] => [
    p[0] - DST_MEAN[0],
    p[1] - DST_MEAN[1],
  ]);

  let a00 = 0;
  let a01 = 0;
  let a10 = 0;
  let a11 = 0;
  for (let i = 0; i < 5; i++) {
    a00 += dstDemean[i][0] * srcDemean[i][0];
    a01 += dstDemean[i][0] * srcDemean[i][1];
    a10 += dstDemean[i][1] * srcDemean[i][0];
    a11 += dstDemean[i][1] * srcDemean[i][1];
  }
  a00 /= 5;
  a01 /= 5;
  a10 /= 5;
  a11 /= 5;

  const { s, U, V } = svd2x2(a00, a01, a10, a11);
  const d: [number, number] = [1, 1];
  const detA = a00 * a11 - a01 * a10;
  if (detA < 0) d[1] = -1;

  const detU = det2(U);
  const detVt = det2(V);
  const smax = Math.max(s[0], s[1]);
  const tol = smax * 2 * 1.1920929e-7;
  let rank = 0;
  if (s[0] > tol) rank += 1;
  if (s[1] > tol) rank += 1;

  const matMul2 = (
    m: [[number, number], [number, number]],
    n: [[number, number], [number, number]]
  ): [[number, number], [number, number]] => [
    [m[0][0] * n[0][0] + m[0][1] * n[1][0], m[0][0] * n[0][1] + m[0][1] * n[1][1]],
    [m[1][0] * n[0][0] + m[1][1] * n[1][0], m[1][0] * n[0][1] + m[1][1] * n[1][1]],
  ];

  let t: [[number, number], [number, number]];
  if (rank === 1) {
    if (detU * detVt > 0) {
      t = matMul2(U, V);
    } else {
      const d1 = -1;
      const ud: [[number, number], [number, number]] = [
        [U[0][0], U[0][1] * d1],
        [U[1][0], U[1][1] * d1],
      ];
      t = matMul2(ud, V);
    }
  } else {
    const ud: [[number, number], [number, number]] = [
      [U[0][0] * d[0], U[0][1] * d[1]],
      [U[1][0] * d[0], U[1][1] * d[1]],
    ];
    t = matMul2(ud, V);
  }

  let var1 = 0;
  let var2 = 0;
  for (let i = 0; i < 5; i++) {
    var1 += srcDemean[i][0] * srcDemean[i][0];
    var2 += srcDemean[i][1] * srcDemean[i][1];
  }
  var1 /= 5;
  var2 /= 5;

  const scale = (1 / (var1 + var2)) * (s[0] * d[0] + s[1] * d[1]);
  const ts0 = t[0][0] * srcMean[0] + t[0][1] * srcMean[1];
  const ts1 = t[1][0] * srcMean[0] + t[1][1] * srcMean[1];
  const tx = DST_MEAN[0] - scale * ts0;
  const ty = DST_MEAN[1] - scale * ts1;

  return [
    [t[0][0] * scale, t[0][1] * scale, tx],
    [t[1][0] * scale, t[1][1] * scale, ty],
  ];
}

let net: cv.Net | undefined;

function getNet(): cv.Net {
  if (!net) {
    net = cv.readNetFromONNX(SFACE_MODEL_PATH);
  }
  return net;
}

export function alignFace(image: cv.Mat, landmarks: [number, number][]): cv.Mat {
  const m = getSimilarityTransformMatrix(landmarks);
  const transformMat = new cv.Mat(m, cv.CV_64FC1);
  return image.warpAffine(transformMat, new cv.Size(112, 112), cv.INTER_LINEAR);
}

export function embedFace(alignedImage: cv.Mat): number[] {
  const blob = cv.blobFromImage(
    alignedImage,
    1,
    new cv.Size(112, 112),
    new cv.Vec3(0, 0, 0),
    true,
    false
  );
  const net = getNet();
  net.setInput(blob);
  const output = net.forward();
  return (output.getDataAsArray() as number[][])[0];
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
