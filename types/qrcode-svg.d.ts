// qrcode-svg ships no type declarations. Declares only the subset of the API
// used in idreesia-common (two-factor setup QR codes).
declare module 'qrcode-svg' {
  interface QRCodeOptions {
    content: string;
    padding?: number;
    width?: number;
    height?: number;
    color?: string;
    background?: string;
    ecl?: 'L' | 'M' | 'H' | 'Q';
    join?: boolean;
    container?: 'svg' | 'svg-viewbox' | 'g' | 'none';
    xmlDeclaration?: boolean;
  }

  export default class QRCode {
    constructor(options: QRCodeOptions | string);
    svg(): string;
  }
}
