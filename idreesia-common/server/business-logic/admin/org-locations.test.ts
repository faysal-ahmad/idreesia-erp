import { describe, expect, it } from 'vitest';

import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';

import {
  assertLocationExists,
  createOrgLocation,
  updateOrgLocation,
} from './org-locations';

const user = { _id: 'u1' };

const seedTree = async () => {
  const root = await createOrgLocation({ name: 'Idreesia', type: OrgLocationTypes.ROOT }, user);
  const pk = await createOrgLocation(
    { name: 'Pakistan', type: OrgLocationTypes.COUNTRY, parentId: root!._id },
    user
  );
  const zone = await createOrgLocation(
    { name: 'Zone A', type: OrgLocationTypes.GROUP, parentId: pk!._id },
    user
  );
  const city = await createOrgLocation(
    { name: 'Lahore', type: OrgLocationTypes.CITY, parentId: zone!._id },
    user
  );
  return { root: root!, pk: pk!, zone: zone!, city: city! };
};

describe('createOrgLocation', () => {
  it('builds allParentIds from the parent chain', async () => {
    const { root, pk, zone, city } = await seedTree();
    expect(city.allParentIds).toEqual([root._id, pk._id, zone._id]);
    expect(city).toMatchObject({ createdBy: 'u1', parentId: zone._id });
  });

  it('allows only one root', async () => {
    await createOrgLocation({ name: 'Idreesia', type: OrgLocationTypes.ROOT }, user);
    await expect(
      createOrgLocation({ name: 'Other', type: OrgLocationTypes.ROOT }, user)
    ).rejects.toThrow('A root location already exists.');
  });

  it('rejects an invalid parent type', async () => {
    const { root } = await seedTree();
    await expect(
      createOrgLocation({ name: 'X', type: OrgLocationTypes.CITY, parentId: root._id }, user)
    ).rejects.toThrow('A city cannot be placed under a root.');
  });

  it('requires a parent for non-root types and rejects duplicate sibling names', async () => {
    const { pk, zone } = await seedTree();
    await expect(
      createOrgLocation({ name: 'X', type: OrgLocationTypes.COUNTRY }, user)
    ).rejects.toThrow('A parent location is required.');
    await expect(
      createOrgLocation({ name: 'Zone A', type: OrgLocationTypes.GROUP, parentId: pk._id }, user)
    ).rejects.toThrow("A location named 'Zone A' already exists under this parent.");
    expect(zone.name).toBe('Zone A');
  });

  it('keeps mehfil details only for mehfils', async () => {
    const { city } = await seedTree();
    const mehfil = await createOrgLocation(
      {
        name: 'Mehfil 1',
        type: OrgLocationTypes.MEHFIL,
        parentId: city._id,
        mehfilDetails: { address: 'Street 1', lcdAvailability: true },
      },
      user
    );
    expect(mehfil!.mehfilDetails).toEqual({
      address: 'Street 1',
      lcdAvailability: true,
    });
  });

  it('keeps the attendance geofence only when the mehfil has a location', async () => {
    const { city } = await seedTree();
    const withLocation = await createOrgLocation(
      {
        name: 'Mehfil 1',
        type: OrgLocationTypes.MEHFIL,
        parentId: city._id,
        mehfilDetails: {
          latitude: 31.5,
          longitude: 74.3,
          attendanceGeofenceMeters: 100,
        },
      },
      user
    );
    expect(withLocation!.mehfilDetails?.attendanceGeofenceMeters).toBe(100);

    const withoutLocation = await createOrgLocation(
      {
        name: 'Mehfil 2',
        type: OrgLocationTypes.MEHFIL,
        parentId: city._id,
        mehfilDetails: { attendanceGeofenceMeters: 100 },
      },
      user
    );
    expect(withoutLocation!.mehfilDetails?.attendanceGeofenceMeters).toBeUndefined();

    // Clearing the location turns it off.
    const cleared = await updateOrgLocation(
      {
        _id: withLocation!._id!,
        name: 'Mehfil 1',
        parentId: city._id,
        mehfilDetails: { attendanceGeofenceMeters: 100 },
      },
      user
    );
    expect(cleared!.mehfilDetails?.attendanceGeofenceMeters).toBeUndefined();
  });

  it('refuses a geofence that is not one of the offered radii', async () => {
    const { city } = await seedTree();
    await expect(
      createOrgLocation(
        {
          name: 'Mehfil 3',
          type: OrgLocationTypes.MEHFIL,
          parentId: city._id,
          mehfilDetails: {
            latitude: 31.5,
            longitude: 74.3,
            attendanceGeofenceMeters: 75,
          },
        },
        user
      )
    ).rejects.toThrow('attendance geofence');
  });
});

describe('updateOrgLocation', () => {
  it('renames a location', async () => {
    const { city } = await seedTree();
    const updated = await updateOrgLocation(
      { _id: city._id!, name: 'Lahore City', parentId: city.parentId },
      { _id: 'u2' }
    );
    expect(updated).toMatchObject({ name: 'Lahore City', updatedBy: 'u2' });
  });

  it('re-parents and rewrites descendant paths', async () => {
    const { root, pk, zone, city } = await seedTree();
    const mehfil = await createOrgLocation(
      { name: 'M1', type: OrgLocationTypes.MEHFIL, parentId: city._id },
      user
    );
    // Move the city directly under the country.
    await updateOrgLocation({ _id: city._id!, name: 'Lahore', parentId: pk._id }, user);
    const moved = await OrgLocations.findOneAsync({ _id: mehfil!._id });
    expect(moved!.allParentIds).toEqual([root._id, pk._id, city._id]);
    expect(zone.allParentIds).toEqual([root._id, pk._id]);
  });

  it('refuses to move a location under its own descendant', async () => {
    const { pk, zone, city } = await seedTree();
    await expect(
      updateOrgLocation({ _id: zone._id!, name: 'Zone A', parentId: city._id }, user)
    ).rejects.toThrow();
    expect(pk.name).toBe('Pakistan');
  });
});

describe('assertLocationExists', () => {
  it('accepts any existing location and rejects unknown ids', async () => {
    const { city } = await seedTree();
    await expect(assertLocationExists(city._id!)).resolves.toBeUndefined();
    await expect(assertLocationExists('missing')).rejects.toThrow('Location not found.');
  });
});
