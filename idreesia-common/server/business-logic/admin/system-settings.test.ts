import { describe, expect, it } from 'vitest';

import { SystemSettings } from 'meteor/idreesia-common/server/collections/admin';

import {
  getSelfAttendanceFaceSettings,
  getPeopleRegistrationImageSettings,
  getPeopleSearchFaceSettings,
  updatePeopleRegistrationImageSettings,
  PEOPLE_REGISTRATION_IMAGE_DEFAULTS,
  updatePeopleSearchFaceSettings,
  PEOPLE_SEARCH_FACE_DEFAULTS,
  SELF_ATTENDANCE_FACE_DEFAULTS,
  updateSelfAttendanceFaceSettings,
} from './system-settings';

const user = { _id: 'u1' };
const values = {
  minSharpness: 40,
  minFacePose: 50,
  matchThreshold: 0.6,
  minMatchMargin: 0.1,
  minDetectionScore: 0.7,
  minFacePixels: 80,
};

describe('getSelfAttendanceFaceSettings', () => {
  it('returns the defaults when nothing is stored', async () => {
    expect(await getSelfAttendanceFaceSettings()).toMatchObject({
      ...SELF_ATTENDANCE_FACE_DEFAULTS,
      updatedAt: null,
      updatedBy: null,
    });
  });

  it('fills missing stored values from the defaults', async () => {
    await SystemSettings.insertAsync({
      _id: 'face-recognition-self-attendance',
      values: { matchThreshold: 0.8 },
      updatedAt: new Date(),
      updatedBy: 'u1',
    });
    expect(await getSelfAttendanceFaceSettings()).toMatchObject({
      ...SELF_ATTENDANCE_FACE_DEFAULTS,
      matchThreshold: 0.8,
    });
  });
});

describe('updateSelfAttendanceFaceSettings', () => {
  it('saves the values and stamps the updater', async () => {
    const saved = await updateSelfAttendanceFaceSettings(values, user);
    expect(saved).toMatchObject({ ...values, updatedBy: 'u1' });
    expect(await getSelfAttendanceFaceSettings()).toMatchObject(values);
  });

  it('overwrites earlier values', async () => {
    await updateSelfAttendanceFaceSettings(values, user);
    await updateSelfAttendanceFaceSettings(
      { ...values, matchThreshold: 0.9 },
      { _id: 'u2' }
    );
    expect(await SystemSettings.find().countAsync()).toBe(1);
    expect(await getSelfAttendanceFaceSettings()).toMatchObject({
      matchThreshold: 0.9,
      updatedBy: 'u2',
    });
  });

  it.each([
    ['matchThreshold', 0.1],
    ['matchThreshold', 1],
    ['minMatchMargin', -0.1],
    ['minDetectionScore', 1],
    ['minFacePixels', 10],
    ['minSharpness', 101],
    ['minFacePose', -1],
    ['minFacePose', 10.5],
    ['minFacePixels', 40.5],
    ['minFacePixels', Number.NaN],
  ])('rejects %s = %s', async (key, value) => {
    await expect(
      updateSelfAttendanceFaceSettings({ ...values, [key]: value }, user)
    ).rejects.toThrow(key);
    expect(await SystemSettings.find().countAsync()).toBe(0);
  });
});

describe('people search face settings', () => {
  const visitorValues = { matchThreshold: 0.65, minMatchMargin: 0.05, minDetectionScore: 0.75, minFacePixels: 60, minSharpness: 20, minFacePose: 10 };

  it('returns the defaults when nothing is stored', async () => {
    expect(await getPeopleSearchFaceSettings()).toMatchObject(
      PEOPLE_SEARCH_FACE_DEFAULTS
    );
  });

  it('saves separately from the self-attendance settings', async () => {
    await updatePeopleSearchFaceSettings(visitorValues, user);
    expect(await getPeopleSearchFaceSettings()).toMatchObject({
      ...visitorValues,
      updatedBy: 'u1',
    });
    expect(await getSelfAttendanceFaceSettings()).toMatchObject(
      SELF_ATTENDANCE_FACE_DEFAULTS
    );
  });

  it('rejects out-of-range values', async () => {
    await expect(
      updatePeopleSearchFaceSettings({ ...visitorValues, minFacePixels: 5 }, user)
    ).rejects.toThrow('minFacePixels');
    expect(await SystemSettings.find().countAsync()).toBe(0);
  });
});

describe('people registration image settings', () => {
  const imageValues = { minDetectionScore: 0.8, minFacePixels: 120, minSharpness: 50, minFacePose: 60 };

  it('returns the defaults when nothing is stored', async () => {
    expect(await getPeopleRegistrationImageSettings()).toMatchObject(
      PEOPLE_REGISTRATION_IMAGE_DEFAULTS
    );
  });

  it('saves separately from the people search settings', async () => {
    await updatePeopleRegistrationImageSettings(imageValues, user);
    expect(await getPeopleRegistrationImageSettings()).toMatchObject({
      ...imageValues,
      updatedBy: 'u1',
    });
    expect(await getPeopleSearchFaceSettings()).toMatchObject(
      PEOPLE_SEARCH_FACE_DEFAULTS
    );
  });

  it('rejects out-of-range values', async () => {
    await expect(
      updatePeopleRegistrationImageSettings({ ...imageValues, minDetectionScore: 1 }, user)
    ).rejects.toThrow('minDetectionScore');
    expect(await SystemSettings.find().countAsync()).toBe(0);
  });
});
