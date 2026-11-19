import { describe, expect, it } from 'vitest';

import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';

import { karkunToPerson, visitorToPerson } from './person-conversion';

describe('visitorToPerson', () => {
  it('maps the flat form values into the person sections', () => {
    expect(
      visitorToPerson({
        _id: 'v1',
        dataSource: 'gate',
        name: 'Ali',
        cnicNumber: '111',
        tagIds: ['t1'],
        city: 'Karachi',
        otherNotes: 'note',
      })
    ).toEqual({
      _id: 'v1',
      isVisitor: true,
      dataSource: 'gate',
      sharedData: { name: 'Ali', cnicNumber: '111', tagIds: ['t1'] },
      visitorData: { city: 'Karachi', otherNotes: 'note' },
    });
  });

  it('drops null and undefined values', () => {
    const person = visitorToPerson({ name: 'Ali', parentName: null });
    expect(person.sharedData).toEqual({ name: 'Ali' });
    expect(person).not.toHaveProperty('_id');
  });

  it('keeps empty strings, so a field can be cleared', () => {
    expect(visitorToPerson({ name: 'Ali', otherNotes: '' }).visitorData).toEqual({
      otherNotes: '',
    });
  });
});

describe('karkunToPerson', () => {
  it('maps the flat form values into the person sections', async () => {
    const person = await karkunToPerson({
      _id: 'k1',
      dataSource: 'karkuns',
      name: 'Ali',
      bloodGroup: 'A+',
      cityLocationId: 'unknown-city',
      ehadKarkun: true,
      jobId: 'j1',
      attachmentIds: ['att1'],
    });
    expect(person).toMatchObject({
      _id: 'k1',
      isKarkun: true,
      dataSource: 'karkuns',
      sharedData: { name: 'Ali', bloodGroup: 'A+' },
      karkunData: {
        cityLocationId: 'unknown-city',
        ehadKarkun: true,
        attachmentIds: ['att1'],
      },
      employeeData: { jobId: 'j1' },
    });
  });

  it('gives the karkun the visitor data of their city', async () => {
    const collection = OrgLocations.rawCollection() as unknown as {
      insertOne(d: object): Promise<unknown>;
    };
    await collection.insertOne({
      _id: 'pk',
      name: 'Pakistan',
      type: 'country',
      allParentIds: ['root'],
    });
    await collection.insertOne({
      _id: 'c1',
      name: 'Karachi',
      type: 'city',
      allParentIds: ['root', 'pk'],
    });

    const person = await karkunToPerson({ name: 'Ali', cityLocationId: 'c1' });
    expect(person.visitorData).toEqual({ city: 'Karachi', country: 'Pakistan' });
  });

  it('keeps null values, so a field can be cleared', async () => {
    const person = await karkunToPerson({ name: 'Ali', parentName: null });
    expect(person.sharedData).toEqual({ name: 'Ali', parentName: null });
  });
});
