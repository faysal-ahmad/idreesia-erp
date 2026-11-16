import { describe, expect, it, vi } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';
import { createWorkbookBuffer } from 'meteor/idreesia-common/server/business-logic/common/excel-exporter';

import { exportKarkuns } from './karkuns-exporter';

// exceljs is only installed for the web app, so the workbook writer is mocked
// and the rows handed to it are checked instead.
vi.mock(
  'meteor/idreesia-common/server/business-logic/common/excel-exporter',
  () => ({
    createWorkbookBuffer: vi.fn(async () => Buffer.from('xlsx')),
  })
);

describe('exportKarkuns', () => {
  it('exports the requested karkuns as numbered rows', async () => {
    await People.insertAsync({
      _id: 'k1',
      sharedData: {
        name: 'Ali',
        parentName: 'Ahmad',
        cnicNumber: '12345-1234567-1',
        contactNumber1: '0300',
        bloodGroup: 'A+',
      },
    } as any);
    await People.insertAsync({ _id: 'k2', sharedData: { name: 'Bilal' } } as any);
    await People.insertAsync({ _id: 'k3', sharedData: { name: 'Other' } } as any);

    const buffer = await exportKarkuns('k1,k2');

    expect(buffer.toString()).toBe('xlsx');
    expect(createWorkbookBuffer).toHaveBeenCalledTimes(1);
    const [rows, sheetName] = vi.mocked(createWorkbookBuffer).mock.calls[0];
    expect(sheetName).toBe('Karkuns');
    expect(rows).toHaveLength(2);
    const ali = rows.find(row => row.Name === 'Ali');
    expect(ali).toMatchObject({
      'S/O': 'Ahmad',
      CNIC: '12345-1234567-1',
      'Mobile No.': '0300',
      'Blood Group': 'A+',
    });
    expect(rows.map(row => row['No.']).sort()).toEqual([1, 2]);
  });

  it('exports no rows when no karkun matches', async () => {
    vi.mocked(createWorkbookBuffer).mockClear();
    await exportKarkuns('nobody');
    expect(vi.mocked(createWorkbookBuffer).mock.calls[0][0]).toEqual([]);
  });
});
