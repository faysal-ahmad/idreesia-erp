// sharp is a real runtime dependency of idreesia-web (see idreesia-web/package.json), but
// idreesia-common/server/business-logic/common/generate-image-thumbnail.ts imports it too, and
// idreesia-common can't physically resolve into idreesia-web's node_modules at typecheck time
// (same situation as 'exceljs', see types/exceljs.d.ts, and '@u4/opencv4nodejs', see
// types/opencv4nodejs.d.ts). This declares only the subset of the API that file uses.
declare module 'sharp' {
  interface ResizeOptions {
    fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  }

  interface JpegOptions {
    quality?: number;
  }

  class Sharp {
    resize(width?: number, height?: number, options?: ResizeOptions): Sharp;
    jpeg(options?: JpegOptions): Sharp;
    toBuffer(): Promise<Buffer>;
  }

  function sharp(input?: Buffer | string): Sharp;

  export default sharp;
}
