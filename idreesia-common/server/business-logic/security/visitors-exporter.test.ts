import { beforeEach, describe, expect, it, vi } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';

// exceljs belongs to the Meteor app, so the workbook writer is replaced by one
// that hands back the rows it was given.
const createWorkbookBuffer = vi.hoisted(() =>
  vi.fn(async (rows: unknown[], sheetName: string) =>
    Buffer.from(JSON.stringify({ sheetName, rows }))
  )
);
vi.mock('meteor/idreesia-common/server/business-logic/common/excel-exporter', () => ({
  createWorkbookBuffer,
}));

const { exportVisitors } = await import('./visitors-exporter');

const exported = async (ids: string) => {
  const buffer = await exportVisitors(ids);
  return JSON.parse(buffer.toString()) as {
    sheetName: string;
    rows: Record<string, unknown>[];
  };
};

const visitor = (id: string, name: string, extra: Record<string, unknown> = {}) => ({
  _id: id,
  isVisitor: true,
  sharedData: {
    name,
    parentName: `${name} father`,
    cnicNumber: `cnic-${id}`,
    contactNumber1: `03-${id}`,
  },
  visitorData: { city: 'Lahore', country: 'Pakistan' },
  ...extra,
});

beforeEach(() => {
  createWorkbookBuffer.mockClear();
});

describe('exportVisitors', () => {
  it('exports every visitor, and only visitors, for "all"', async () => {
    await (People.rawCollection() as any).insertMany([
      visitor('v1', 'Ali'),
      visitor('v2', 'Sara'),
      visitor('k1', 'Karkun', { isVisitor: false }),
    ] as any);
    const { sheetName, rows } = await exported('all');
    expect(sheetName).toBe('Visitors');
    expect(rows.map(r => r.Name).sort()).toEqual(['Ali', 'Sara']);
    expect(rows.map(r => r['No.'])).toEqual([1, 2]);
    expect(rows.find(r => r.Name === 'Ali')).toEqual({
      'No.': expect.any(Number),
      Name: 'Ali',
      'S/O': 'Ali father',
      CNIC: 'cnic-v1',
      'Mobile No.': '03-v1',
      'City/Country': 'Lahore, Pakistan',
    });
  });

  it('exports just the listed ids', async () => {
    await (People.rawCollection() as any).insertMany([
      visitor('v1', 'Ali'),
      visitor('v2', 'Sara'),
      visitor('v3', 'Omar'),
    ] as any);
    const { rows } = await exported('v1,v3');
    expect(rows.map(r => r.Name).sort()).toEqual(['Ali', 'Omar']);
  });

  it('does not export a non-visitor even when listed', async () => {
    await (People.rawCollection() as any).insertOne(visitor('k1', 'Karkun', { isVisitor: false }) as any);
    expect((await exported('k1')).rows).toEqual([]);
  });

  it('produces an empty sheet when there are no visitors', async () => {
    expect((await exported('all')).rows).toEqual([]);
  });
});
