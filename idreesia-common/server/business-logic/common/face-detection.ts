import * as cv from '@u4/opencv4nodejs';

import { YUNET_MODEL_PATH } from './face-vector-model-paths';

export interface DetectedFace {
  box: { x: number; y: number; width: number; height: number };
  confidence: number;
  // 5 landmarks in order: right eye, left eye, nose tip, right mouth corner, left mouth corner.
  landmarks: [number, number][];
}

const DIVISOR = 32;
const STRIDES = [8, 16, 32];
const OUTPUT_NAMES = [
  'cls_8',
  'cls_16',
  'cls_32',
  'obj_8',
  'obj_16',
  'obj_32',
  'bbox_8',
  'bbox_16',
  'bbox_32',
  'kps_8',
  'kps_16',
  'kps_32',
];

let net: cv.Net | undefined;

function getNet(): cv.Net {
  if (!net) {
    net = cv.readNetFromONNX(YUNET_MODEL_PATH);
  }
  return net;
}

// Ported from OpenCV's FaceDetectorYNImpl::postProcess (modules/objdetect/src/face_detect.cpp) -
// @u4/opencv4nodejs doesn't wrap FaceDetectorYN, only the generic cv.dnn module, so YuNet's
// anchor-based raw output has to be decoded by hand exactly as the C++ does.
export function detectFaces(
  image: cv.Mat,
  scoreThreshold = 0.7,
  nmsThreshold = 0.3
): DetectedFace[] {
  const inputW = image.cols;
  const inputH = image.rows;
  const padW = (Math.floor((inputW - 1) / DIVISOR) + 1) * DIVISOR;
  const padH = (Math.floor((inputH - 1) / DIVISOR) + 1) * DIVISOR;

  const padded = image.copyMakeBorder(
    0,
    padH - inputH,
    0,
    padW - inputW,
    cv.BORDER_CONSTANT,
    new cv.Vec3(0, 0, 0)
  );
  const blob = cv.blobFromImage(padded);

  const net = getNet();
  net.setInput(blob);
  const outputs = net.forward(OUTPUT_NAMES);

  const cls = outputs.slice(0, 3);
  const obj = outputs.slice(3, 6);
  const bbox = outputs.slice(6, 9);
  const kps = outputs.slice(9, 12);

  const boxes: cv.Rect[] = [];
  const scores: number[] = [];
  const rawFaces: { box: cv.Rect; score: number; landmarks: [number, number][] }[] = [];

  STRIDES.forEach((stride, strideIdx) => {
    const cols = Math.floor(padW / stride);
    const rows = Math.floor(padH / stride);

    // getDataAsArray() has both a number[][] and number[][][] overload with identical
    // (empty) parameter lists, so TS always infers the first - these Mats are actually
    // 3D at runtime, hence the unknown bridge.
    const clsData = cls[strideIdx].getDataAsArray() as unknown as number[][][];
    const objData = obj[strideIdx].getDataAsArray() as unknown as number[][][];
    const bboxData = bbox[strideIdx].getDataAsArray() as unknown as number[][][];
    const kpsData = kps[strideIdx].getDataAsArray() as unknown as number[][][];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = r * cols + c;
        const clsScore = Math.min(Math.max(clsData[0][idx][0], 0), 1);
        const objScore = Math.min(Math.max(objData[0][idx][0], 0), 1);
        const score = Math.sqrt(clsScore * objScore);
        if (score < scoreThreshold) continue;

        const bboxRow = bboxData[0][idx];
        const cx = (c + bboxRow[0]) * stride;
        const cy = (r + bboxRow[1]) * stride;
        const w = Math.exp(bboxRow[2]) * stride;
        const h = Math.exp(bboxRow[3]) * stride;
        const x1 = cx - w / 2;
        const y1 = cy - h / 2;

        const kpsRow = kpsData[0][idx];
        const landmarks: [number, number][] = [];
        for (let n = 0; n < 5; n++) {
          landmarks.push([(kpsRow[2 * n] + c) * stride, (kpsRow[2 * n + 1] + r) * stride]);
        }

        const box = new cv.Rect(x1, y1, w, h);
        boxes.push(box);
        scores.push(score);
        rawFaces.push({ box, score, landmarks });
      }
    }
  });

  if (rawFaces.length === 0) return [];

  const keepIndices =
    rawFaces.length > 1
      ? cv.NMSBoxes(boxes, scores, scoreThreshold, nmsThreshold, { eta: 1, topK: 0 })
      : [0];

  return keepIndices.map((i) => ({
    box: {
      x: rawFaces[i].box.x,
      y: rawFaces[i].box.y,
      width: rawFaces[i].box.width,
      height: rawFaces[i].box.height,
    },
    confidence: rawFaces[i].score,
    landmarks: rawFaces[i].landmarks,
  }));
}
