import { beforeEach, describe, expect, it, vi } from 'vitest';

import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  SecurityServerAlerts,
  SecurityServerProfiles,
  VisitorStays,
} from 'meteor/idreesia-common/server/collections/security';
import * as security from 'meteor/idreesia-common/server/business-logic/security/security-server';
import { getSecurityServerAlerts } from 'meteor/idreesia-common/server/business-logic/security/security-server/alert-search';
import { getSecurityServerProfiles } from 'meteor/idreesia-common/server/business-logic/security/security-server/profile-search';
import { getVisitorStays } from 'meteor/idreesia-common/server/business-logic/security/visitor-stay-search';

import { getWorkspaceMonitoringAlerts } from './monitoring-alerts';
import {
  addWorkspaceMonitoringProfilePhoto,
  getWorkspaceMonitoringProfileById,
  getWorkspaceMonitoringProfiles,
  removeWorkspaceMonitoringProfilePhoto,
  updateWorkspaceMonitoringProfile,
} from './monitoring-profiles';
import {
  getNightStayById,
  getNightStayHistory,
  getNightStays,
} from './night-stay-report';

// The security-server barrel loads native image libraries.
vi.mock('meteor/idreesia-common/server/business-logic/security/security-server', () => ({
  addSecurityServerProfileImage: vi.fn(),
  removeSecurityServerProfileImage: vi.fn(),
  updateSecurityServerProfile: vi.fn(),
  resolveSecurityServerProfileDefaultImageId: vi.fn(
    ({ defaultImageId, images }: any) => defaultImageId ?? images[0]?._id
  ),
}));
vi.mock(
  'meteor/idreesia-common/server/business-logic/security/security-server/profile-search',
  () => ({ getSecurityServerProfiles: vi.fn() })
);
vi.mock(
  'meteor/idreesia-common/server/business-logic/security/security-server/alert-search',
  () => ({ getSecurityServerAlerts: vi.fn() })
);
vi.mock('meteor/idreesia-common/server/business-logic/security/visitor-stay-search', () => ({
  getVisitorStays: vi.fn(),
}));
vi.mock('meteor/idreesia-common/server/file-storage', async () => {
  const mock = await import('meteor/idreesia-common/server/test-utils/file-storage-mock');
  (mock.getFileUrl as any).mockImplementation(async (key: string) => `https://files.test/${key}`);
  return mock;
});

const sec = vi.mocked(security);
const alertSearch = vi.mocked(getSecurityServerAlerts);
const profileSearch = vi.mocked(getSecurityServerProfiles);
const staySearch = vi.mocked(getVisitorStays);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('monitoring alerts report', () => {
  it('asks for one day, includes test profiles by default, and shows only report fields with image urls', async () => {
    alertSearch.mockResolvedValue({
      totalResults: 1,
      data: [
        {
          _id: 'a1',
          timestamp: new Date('2026-06-01T10:00:00Z'),
          profileName: 'Guest',
          channelName: 'Gate',
          similarityScore: 0.9,
          review: 'ok',
          imageKey: 'alerts/a1.jpg',
          faceQuality: { sharp: 1 },
          reviewedBy: 'secret-reviewer',
        },
        { _id: 'a2', profileIsTest: true },
      ],
    } as never);

    const result = await getWorkspaceMonitoringAlerts({ date: '01-06-2026', pageIndex: '0', pageSize: '10' });

    expect(alertSearch).toHaveBeenCalledWith({
      startDate: '01-06-2026',
      endDate: '01-06-2026',
      includeTest: 'true',
      pageIndex: '0',
      pageSize: '10',
    });
    expect(result.totalResults).toBe(1);
    expect(result.data[0]).toEqual({
      _id: 'a1',
      timestamp: new Date('2026-06-01T10:00:00Z'),
      profileName: 'Guest',
      profileIsTest: false,
      channelName: 'Gate',
      similarityScore: 0.9,
      review: 'ok',
      imageUrl: 'https://files.test/alerts/a1.jpg',
      thumbnailUrl: null,
    });
    expect(result.data[1]).toMatchObject({ profileIsTest: true, imageUrl: null });
    expect(JSON.stringify(result)).not.toContain('secret-reviewer');
    expect(JSON.stringify(result)).not.toContain('faceQuality');
  });

  it('leaves test profiles out only when includeTest is exactly false', async () => {
    alertSearch.mockResolvedValue({ totalResults: 0, data: [] } as never);
    await getWorkspaceMonitoringAlerts({ date: '01-06-2026', includeTest: false });
    expect(alertSearch.mock.calls[0][0]).toMatchObject({ includeTest: 'false' });
    await getWorkspaceMonitoringAlerts({ date: '01-06-2026', includeTest: null });
    expect(alertSearch.mock.calls[1][0]).toMatchObject({ includeTest: 'true' });
  });
});

describe('monitoring profiles', () => {
  const user = { _id: 'u1' } as never;

  const seedProfile = (extra: Record<string, unknown> = {}) =>
    SecurityServerProfiles.insertAsync({
      _id: 'pr1',
      name: 'Guest',
      isTest: false,
      images: [
        { _id: 'i1', imageKey: 'k1', thumbnailKey: 't1' },
        { _id: 'i2', imageKey: 'k2' },
      ],
      defaultImageId: 'i2',
      ...extra,
    } as any);

  it('shows photos as urls, default photo first, with the alerts count and no audit fields', async () => {
    await seedProfile({ createdBy: 'secret' });
    await SecurityServerAlerts.insertAsync({ _id: 'al1', profileId: 'pr1' } as any);
    await SecurityServerAlerts.insertAsync({ _id: 'al2', profileId: 'pr1' } as any);
    await SecurityServerAlerts.insertAsync({ _id: 'al3', profileId: 'other' } as any);

    const profile = await getWorkspaceMonitoringProfileById('pr1');
    expect(profile).toEqual({
      _id: 'pr1',
      name: 'Guest',
      isTest: false,
      photos: [
        { _id: 'i2', imageUrl: 'https://files.test/k2', thumbnailUrl: null },
        { _id: 'i1', imageUrl: 'https://files.test/k1', thumbnailUrl: 'https://files.test/t1' },
      ],
      alertsCount: 2,
    });
  });

  it('does not return a deleted or missing profile', async () => {
    await seedProfile({ deletedAt: new Date() });
    expect(await getWorkspaceMonitoringProfileById('pr1')).toBeNull();
    expect(await getWorkspaceMonitoringProfileById('nope')).toBeNull();
  });

  it('lists profiles from the search, converting each, and includes test profiles unless false', async () => {
    await seedProfile();
    profileSearch.mockResolvedValue({
      totalResults: 1,
      data: [await SecurityServerProfiles.findOneAsync('pr1')],
    } as never);
    const result = await getWorkspaceMonitoringProfiles({ name: 'gu', includeTest: false, pageIndex: '1' });
    expect(profileSearch).toHaveBeenCalledWith({ name: 'gu', includeTest: 'false', pageIndex: '1', pageSize: undefined });
    expect(result.totalResults).toBe(1);
    expect(result.data[0].photos[0]._id).toBe('i2');
    await getWorkspaceMonitoringProfiles({});
    expect(profileSearch.mock.calls[1][0]).toMatchObject({ includeTest: 'true' });
  });

  it('renames with a trimmed name and refuses an empty one before touching the server', async () => {
    await seedProfile();
    await expect(
      updateWorkspaceMonitoringProfile(user, 'pr1', { name: '   ', isTest: false } as never)
    ).rejects.toThrow('Please enter a name.');
    expect(sec.updateSecurityServerProfile).not.toHaveBeenCalled();

    const result = await updateWorkspaceMonitoringProfile(user, 'pr1', { name: '  New  ', isTest: true } as never);
    expect(sec.updateSecurityServerProfile).toHaveBeenCalledWith(user, 'pr1', { name: 'New', isTest: true });
    expect(result?._id).toBe('pr1');
  });

  it('adds a photo from a data url or raw base64 as a jpeg buffer', async () => {
    await seedProfile();
    const b64 = Buffer.from('face').toString('base64');
    await addWorkspaceMonitoringProfilePhoto(user, 'pr1', `data:image/png;base64,${b64}`);
    await addWorkspaceMonitoringProfilePhoto(user, 'pr1', b64);
    for (const call of sec.addSecurityServerProfileImage.mock.calls) {
      expect(call[1]).toBe('pr1');
      expect(call[2]).toMatchObject({ mimeType: 'image/jpeg' });
      expect((call[2] as any).data.toString()).toBe('face');
    }
    expect(sec.addSecurityServerProfileImage).toHaveBeenCalledTimes(2);
  });

  it('passes a rejected photo through and does not return a profile', async () => {
    await seedProfile();
    sec.addSecurityServerProfileImage.mockRejectedValueOnce(new Error('No face found'));
    await expect(addWorkspaceMonitoringProfilePhoto(user, 'pr1', 'AAAA')).rejects.toThrow('No face found');
  });

  it('removes a photo and returns the profile', async () => {
    await seedProfile();
    const profile = await removeWorkspaceMonitoringProfilePhoto(user, 'pr1', 'i1');
    expect(sec.removeSecurityServerProfileImage).toHaveBeenCalledWith(user, 'pr1', 'i1');
    expect(profile?._id).toBe('pr1');
  });
});

describe('night stay report', () => {
  it('excludes cancelled stays, passes filters through and drops empty ones', async () => {
    staySearch.mockResolvedValue({ totalResults: 0, data: [] } as never);
    await getNightStays({ stayDate: '01-06-2026', name: 'Ali', city: '', stayReason: null, pageIndex: '2' });
    const query = new URLSearchParams(String(staySearch.mock.calls[0][0]).replace(/^\?/, ''));
    expect(query.get('excludeCancelled')).toBe('true');
    expect(query.get('stayDate')).toBe('01-06-2026');
    expect(query.get('name')).toBe('Ali');
    expect(query.get('pageIndex')).toBe('2');
    expect(query.has('city')).toBe(false);
    expect(query.has('stayReason')).toBe(false);
  });

  it('shows only report fields: no CNIC, contact or notes', async () => {
    staySearch.mockResolvedValue({
      totalResults: 1,
      data: [
        {
          _id: 's1',
          visitorId: 'v1',
          fromDate: new Date('2026-06-01'),
          toDate: new Date('2026-06-03'),
          numOfDays: 2,
          stayReason: 'Event',
          stayAllowedBy: 'Admin',
          notes: 'private note',
          visitor: [
            {
              sharedData: { name: 'Ali', cnicNumber: '12345', contactNumber1: '0300' },
              visitorData: { city: 'Lahore', country: 'PK', criminalRecord: 'x' },
            },
          ],
        },
        { _id: 's2', visitorId: 'v2' },
      ],
    } as never);
    const result = await getNightStays({ stayDate: '01-06-2026' });
    expect(result.totalResults).toBe(1);
    expect(result.data[0]).toMatchObject({
      _id: 's1',
      visitorId: 'v1',
      visitorName: 'Ali',
      city: 'Lahore',
      country: 'PK',
      numOfDays: 2,
      stayAllowedBy: 'Admin',
    });
    const json = JSON.stringify(result);
    expect(json).not.toContain('12345');
    expect(json).not.toContain('0300');
    expect(json).not.toContain('private note');
    expect(json).not.toContain('criminalRecord');
    expect(result.data[1].visitorName).toBeUndefined();
  });

  it('gives the latest five stays of a visitor, newest first, without the shown or cancelled ones', async () => {
    for (let day = 1; day <= 8; day += 1) {
      await VisitorStays.insertAsync({
        _id: `s${day}`,
        visitorId: 'v1',
        fromDate: new Date(2026, 0, day),
        toDate: new Date(2026, 0, day + 1),
        numOfDays: 1,
        stayReason: `r${day}`,
        ...(day === 7 ? { cancelledDate: new Date() } : {}),
      } as any);
    }
    await VisitorStays.insertAsync({ _id: 'x', visitorId: 'v2', fromDate: new Date(2026, 5, 1) } as any);

    const history = await getNightStayHistory('v1', 's8');
    expect(history.map(h => h._id)).toEqual(['s6', 's5', 's4', 's3', 's2']);
    expect(history[0]).toEqual({
      _id: 's6',
      fromDate: new Date(2026, 0, 6),
      toDate: new Date(2026, 0, 7),
      numOfDays: 1,
      stayReason: 'r6',
    });
  });

  it('returns one stay with its visitor, and null when missing or cancelled', async () => {
    await People.insertAsync({
      _id: 'v1',
      sharedData: { name: 'Ali', cnicNumber: '12345' },
      visitorData: { city: 'Lahore' },
    } as any);
    await VisitorStays.insertAsync({ _id: 's1', visitorId: 'v1', numOfDays: 2 } as any);
    await VisitorStays.insertAsync({ _id: 's2', visitorId: 'v1', cancelledDate: new Date() } as any);

    const stay = await getNightStayById('s1');
    expect(stay).toMatchObject({ _id: 's1', visitorName: 'Ali', city: 'Lahore' });
    expect(JSON.stringify(stay)).not.toContain('12345');
    expect(await getNightStayById('s2')).toBeNull();
    expect(await getNightStayById('nope')).toBeNull();
  });
});
