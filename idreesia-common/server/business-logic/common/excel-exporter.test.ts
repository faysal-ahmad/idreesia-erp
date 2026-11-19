import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createWorkbookBuffer } from './excel-exporter';

// exceljs is only installed for the web app, so the workbook is replaced by
// one that records what was written to it.
const sheets = vi.hoisted(
  () =>
    [] as Array<{
      name: string;
      columns: Array<{ header: string; key: string }>;
      rows: Array<Record<string, unknown>>;
    }>
);

vi.mock('exceljs', () => {
  class Workbook {
    xlsx = {
      writeBuffer: async () => new Uint8Array([1, 2, 3]),
    };

    addWorksheet(name: string) {
      const sheet = {
        name,
        columns: [] as Array<{ header: string; key: string }>,
        rows: [] as Array<Record<string, unknown>>,
        addRow(row: Record<string, unknown>) {
          sheet.rows.push(row);
        },
      };
      sheets.push(sheet);
      return sheet;
    }
  }
  return { default: { Workbook } };
});

beforeEach(() => {
  sheets.length = 0;
});

describe('createWorkbookBuffer', () => {
  it('uses the keys of the first record as headers, then adds a row per record', async () => {
    const rows = [
      { Name: 'Ali', Age: 30 },
      { Name: 'Sara', Age: 25 },
    ];
    await createWorkbookBuffer(rows, 'People');

    expect(sheets).toHaveLength(1);
    expect(sheets[0].name).toBe('People');
    expect(sheets[0].columns).toEqual([
      { header: 'Name', key: 'Name' },
      { header: 'Age', key: 'Age' },
    ]);
    expect(sheets[0].rows).toEqual(rows);
  });

  it('writes an empty sheet, without columns, when there are no records', async () => {
    await createWorkbookBuffer([], 'Empty');
    expect(sheets[0]).toMatchObject({ name: 'Empty', columns: [], rows: [] });
  });

  it('returns the workbook as a Buffer', async () => {
    const buffer = await createWorkbookBuffer([{ a: 1 }], 'S');
    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect([...buffer]).toEqual([1, 2, 3]);
  });
});
