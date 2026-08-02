declare module 'exceljs' {
  class Workbook {
    addWorksheet(name: string): { columns: unknown; addRow(row: unknown): void };
    xlsx: { writeBuffer(): Promise<Buffer | ArrayBuffer> };
  }

  const ExcelJS: { Workbook: typeof Workbook };
  export default ExcelJS;
}
