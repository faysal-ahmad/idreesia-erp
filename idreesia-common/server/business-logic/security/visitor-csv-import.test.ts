import { differenceInCalendarDays } from 'date-fns';
import { describe, expect, it, vi } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';

// The barrel pulls in face recognition (opencv); only the uniqueness checks are used.
vi.mock('meteor/idreesia-common/server/business-logic/common', async () =>
  import('meteor/idreesia-common/server/business-logic/common/people/person-uniqueness')
);

const { processCsvData } = await import('./visitor-csv-import');

const HEADER = 'Name,S/O,CNIC,City,Mobile No.,Arsa Ehad,Maarfat';
const date = new Date('2024-05-01T00:00:00Z');
const user = { _id: 'u1' };

const run = async (...rows: string[]) =>
  JSON.parse(await processCsvData([HEADER, ...rows].join('\n'), date, user));

describe('processCsvData', () => {
  it('imports a row as a non-karkun person with visitor data', async () => {
    const result = await run('Ali,Ahmed,12345-1234567-1,Lahore,0300-1111111,2,Bilal');
    expect(result).toEqual({ imported: 1, ignored: 0 });

    const [person] = await People.find({}).fetchAsync();
    expect(person).toMatchObject({
      isEmployee: false,
      isKarkun: false,
      userid: null,
      sharedData: {
        name: 'Ali',
        parentName: 'Ahmed',
        cnicNumber: '12345-1234567-1',
        contactNumber1: '0300-1111111',
        referenceName: 'Bilal',
      },
      visitorData: { city: 'Lahore', country: 'Pakistan' },
      createdAt: date,
      createdBy: 'u1',
      updatedAt: date,
      updatedBy: 'u1',
    });
  });

  it('derives the ehad date from the number of years', async () => {
    await run('Ali,,12345-1234567-1,,,3,');
    const [person] = await People.find({}).fetchAsync();
    const days = differenceInCalendarDays(new Date(), person.sharedData.ehadDate);
    expect(days).toBeGreaterThanOrEqual(365 * 3);
    expect(days).toBeLessThanOrEqual(365 * 3 + 2);
  });

  it('ignores rows with neither CNIC nor phone number', async () => {
    const result = await run('Ali,Ahmed,,Lahore,,1,', 'Sara,,,Karachi,,,');
    expect(result).toEqual({ imported: 0, ignored: 2 });
    expect(await People.find({}).countAsync()).toBe(0);
  });

  it('imports rows that have only a phone number or only a CNIC', async () => {
    const result = await run('A,,,,0300-1,,', 'B,,12345-1234567-1,,,,');
    expect(result).toEqual({ imported: 2, ignored: 0 });
  });

  it('ignores rows whose CNIC or phone already belongs to a person', async () => {
    await (People.rawCollection() as any).insertMany([
      { _id: 'p1', sharedData: { name: 'X', cnicNumber: '11111-1111111-1' } },
      { _id: 'p2', sharedData: { name: 'Y', contactNumber2: '0300-2' } },
    ] as any);
    const result = await run(
      'A,,11111-1111111-1,,,,',
      'B,,,,0300-2,,',
      'C,,22222-2222222-2,,0300-3,,'
    );
    expect(result).toEqual({ imported: 1, ignored: 2 });
    expect(await People.find({}).countAsync()).toBe(3);
  });

  it('is not blocked by a deleted person with the same CNIC', async () => {
    await (People.rawCollection() as any).insertOne({
      _id: 'p1',
      sharedData: { cnicNumber: '11111-1111111-1' },
      deletedAt: new Date(),
    } as any);
    expect(await run('A,,11111-1111111-1,,,,')).toEqual({ imported: 1, ignored: 0 });
  });

  it('ignores a duplicate within the same file', async () => {
    const result = await run('A,,11111-1111111-1,,,,', 'B,,11111-1111111-1,,,,');
    expect(result).toEqual({ imported: 1, ignored: 1 });
  });

  it('copes with quoted fields, CRLF line endings and a header-only file', async () => {
    const csv = `${HEADER}\r\n"Khan, Ali",S,11111-1111111-1,"Lahore",,,\r\n`;
    expect(JSON.parse(await processCsvData(csv, date, user))).toEqual({
      imported: 1,
      ignored: 0,
    });
    const [person] = await People.find({}).fetchAsync();
    expect(person.sharedData.name).toBe('Khan, Ali');

    expect(JSON.parse(await processCsvData(HEADER, date, user))).toEqual({
      imported: 0,
      ignored: 0,
    });
    expect(JSON.parse(await processCsvData('', date, user))).toEqual({
      imported: 0,
      ignored: 0,
    });
  });
});
