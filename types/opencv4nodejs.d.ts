// @u4/opencv4nodejs is a real runtime dependency of idreesia-web (see idreesia-web/package.json),
// but several idreesia-common/server/business-logic/common files (face-detection.ts,
// face-recognition.ts, compute-image-vector-data.ts) import it too, and idreesia-common can't
// physically resolve into idreesia-web's node_modules at typecheck time (same situation as
// 'exceljs', see types/exceljs.d.ts). This declares only the subset of the API those files use.
declare module '@u4/opencv4nodejs' {
  export class Vec3 {
    constructor(x: number, y: number, z: number);
  }

  export class Size {
    constructor(width: number, height: number);
  }

  export class Rect {
    x: number;
    y: number;
    width: number;
    height: number;
    constructor(x: number, y: number, width: number, height: number);
  }

  export class Mat {
    cols: number;
    rows: number;
    constructor(data: number[][], type: number);
    copyMakeBorder(
      top: number,
      bottom: number,
      left: number,
      right: number,
      borderType: number,
      value?: Vec3
    ): Mat;
    warpAffine(transform: Mat, size: Size, interpolation: number): Mat;
    getDataAsArray(): number[][];
  }

  export class Net {
    setInput(blob: Mat): void;
    forward(): Mat;
    forward(outputNames: string[]): Mat[];
  }

  export function readNetFromONNX(path: string): Net;
  export function imdecode(buffer: Buffer): Mat;

  export function blobFromImage(image: Mat): Mat;
  export function blobFromImage(
    image: Mat,
    scaleFactor: number,
    size: Size,
    mean: Vec3,
    swapRB: boolean,
    crop: boolean
  ): Mat;

  export function NMSBoxes(
    boxes: Rect[],
    scores: number[],
    scoreThreshold: number,
    nmsThreshold: number,
    params?: { eta?: number; topK?: number }
  ): number[];

  export const BORDER_CONSTANT: number;
  export const INTER_LINEAR: number;
  export const CV_64FC1: number;
}
