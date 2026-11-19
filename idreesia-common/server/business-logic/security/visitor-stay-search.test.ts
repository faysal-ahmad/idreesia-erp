import { beforeEach, describe, expect, it } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';
import { VisitorStays } from 'meteor/idreesia-common/server/collections/security';

import { getVisitorStays } from './visitor-stay-search';

// Dates are given as DD-MM-YYYY in the query string, stays as local dates.
const day = (d: string) => new Date(`${d}T12:00:00`);

const addVisitor = (_id: string, name: string, city: string, visitorData = {}) =>
  (People.rawCollection() as any).insertOne({
    _id,
    isVisitor: true,
    sharedData: { name },
    visitorData: { city, ...visitorData },
  } as any);

const addStay = (
  _id: string,
  visitorId: string,
  fromDate: string,
  toDate: string,
  extra: Record<string, unknown> = {}
) =>
  (VisitorStays.rawCollection() as any).insertOne({
    _id,
    visitorId,
    fromDate: day(fromDate),
    toDate: day(toDate),
    ...extra,
  } as any);

const ids = async (query: string) =>
  (await getVisitorStays(query)).data.map((stay: any) => stay._id);

beforeEach(async () => {
  await addVisitor('v1', 'Ali Khan', 'Lahore', { otherNotes: 'allergic' });
  await addVisitor('v2', 'Sara Bibi', 'Karachi', { criminalRecord: 'yes' });
  await addVisitor('v3', 'Omar Farooq', 'Lahore', { otherNotes: '' });
  await addStay('s1', 'v1', '2024-01-01', '2024-01-05', { stayReason: 'Mehfil' });
  await addStay('s2', 'v2', '2024-01-10', '2024-01-12', { stayReason: 'Visit' });
  await addStay('s3', 'v3', '2024-01-03', '2024-01-20', {
    stayReason: 'Mehfil',
    cancelledDate: day('2024-01-04'),
  });
});

describe('getVisitorStays', () => {
  it('returns all stays, newest first, with the visitor attached', async () => {
    const { data, totalResults } = await getVisitorStays('');
    expect(data.map((s: any) => s._id)).toEqual(['s2', 's3', 's1']);
    expect((data[0] as any).visitor[0].sharedData.name).toBe('Sara Bibi');
    expect(totalResults).toBe(3);
  });

  it('filters by visitor, reason, city', async () => {
    expect(await ids('visitorId=v1')).toEqual(['s1']);
    expect((await ids('stayReason=Mehfil')).sort()).toEqual(['s1', 's3']);
    expect((await ids('city=Lahore')).sort()).toEqual(['s1', 's3']);
    expect(await ids('city=Karachi&stayReason=Mehfil')).toEqual([]);
  });

  it('leaves cancelled stays out only when asked', async () => {
    expect(await ids('excludeCancelled=true')).toEqual(['s2', 's1']);
    expect(await ids('excludeCancelled=false')).toContain('s3');
  });

  it('matches stays that overlap the start/end range', async () => {
    // s3 started before the range and runs past it.
    expect((await ids('startDate=08-01-2024&endDate=09-01-2024')).sort()).toEqual(['s3']);
    expect((await ids('startDate=05-01-2024')).sort()).toEqual(['s1', 's2', 's3']);
    expect((await ids('startDate=06-01-2024')).sort()).toEqual(['s2', 's3']);
    expect((await ids('endDate=02-01-2024')).sort()).toEqual(['s1']);
    expect(await ids('startDate=21-01-2024')).toEqual([]);
  });

  it('matches stays covering a single day, including boundary days', async () => {
    expect(await ids('stayDate=05-01-2024')).toEqual(['s3', 's1']);
    expect(await ids('stayDate=01-01-2024')).toEqual(['s1']);
    expect(await ids('stayDate=12-01-2024')).toEqual(['s2', 's3']);
    expect(await ids('stayDate=25-01-2024')).toEqual([]);
  });

  it('filters by additional info', async () => {
    expect(await ids('additionalInfo=has-notes')).toEqual(['s1']);
    expect(await ids('additionalInfo=has-criminal-record')).toEqual(['s2']);
    expect((await ids('additionalInfo=has-notes-or-criminal-record')).sort()).toEqual([
      's1',
      's2',
    ]);
    // An unknown value applies no filter.
    expect(await ids('additionalInfo=whatever')).toHaveLength(3);
  });

  it('sorts by stay date in either direction', async () => {
    expect(await ids('sortBy=stayDate&sortOrder=asc')).toEqual(['s1', 's3', 's2']);
    expect(await ids('sortBy=stayDate&sortOrder=desc')).toEqual(['s2', 's3', 's1']);
  });

  it('pages the results but counts all of them', async () => {
    const page = await getVisitorStays('sortOrder=asc&pageIndex=1&pageSize=2');
    expect(page.data.map((s: any) => s._id)).toEqual(['s2']);
    expect(page.totalResults).toBe(3);
  });

  it('rejects an invalid sort order, sort column or page values', async () => {
    await expect(getVisitorStays('sortOrder=sideways')).rejects.toThrow('sortOrder');
    await expect(getVisitorStays('sortBy=password')).rejects.toThrow('sortBy');
    await expect(getVisitorStays('pageIndex=abc')).rejects.toThrow('pageIndex or pageSize');
  });

  it('ignores a repeated (array) parameter instead of failing', async () => {
    expect(await ids('city=Lahore&city=Karachi')).toHaveLength(3);
  });

  it('finds visitors by name using the text index', async () => {
    await People.rawCollection().createIndex({ 'sharedData.name': 'text' });
    expect(await ids('name=Sara')).toEqual(['s2']);
    expect(await ids('name=Lahore')).toEqual([]);
    expect((await ids('name=Ali&city=Lahore')).sort()).toEqual(['s1']);
  });
});
