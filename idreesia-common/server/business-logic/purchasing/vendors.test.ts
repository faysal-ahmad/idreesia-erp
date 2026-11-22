import { describe, expect, it } from 'vitest';

import { AuditLogs } from 'meteor/idreesia-common/server/collections/common';
import { PurchasingVendors } from 'meteor/idreesia-common/server/collections/purchasing';

import {
  createVendor,
  deleteVendor,
  getUsableVendor,
  listVendors,
  setVendorActive,
  updateVendor,
} from './index';

const user = { _id: 'u1' };

describe('purchasing vendors', () => {
  it('creates an active vendor, trims text and writes an audit log', async () => {
    const vendor = await createVendor(
      { name: '  Acme   Traders ', phone: ' 0300 ', email: '  ' },
      user
    );
    expect(vendor.name).toBe('Acme Traders');
    expect(vendor.phone).toBe('0300');
    expect(vendor.email).toBeUndefined();
    expect(vendor.isActive).toBe(true);
    expect(vendor.createdBy).toBe('u1');
    expect(await AuditLogs.find({ entityId: vendor._id }).countAsync()).toBe(1);
  });

  it('rejects a blank name and a negative payment term', async () => {
    await expect(createVendor({ name: '   ' }, user)).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
    await expect(
      createVendor({ name: 'X', paymentTermsDays: -1 }, user)
    ).rejects.toMatchObject({ extensions: { code: 'BAD_USER_INPUT' } });
  });

  it('rejects a duplicate name, ignoring case, but allows keeping its own', async () => {
    const vendor = await createVendor({ name: 'Dup Co' }, user);
    await expect(createVendor({ name: 'dup co' }, user)).rejects.toMatchObject({
      extensions: { code: 'CONFLICT' },
    });
    const updated = await updateVendor(
      vendor._id,
      { name: 'DUP CO', notes: 'n' },
      user
    );
    expect(updated.name).toBe('DUP CO');
  });

  it('clears optional fields that are left blank on update', async () => {
    const vendor = await createVendor({ name: 'Clear Co', phone: '1' }, user);
    const updated = await updateVendor(vendor._id, { name: 'Clear Co' }, user);
    expect(updated.phone).toBeUndefined();
  });

  it('keeps a vendor but refuses it for new documents once inactive', async () => {
    const vendor = await createVendor({ name: 'Idle Co' }, user);
    await setVendorActive(vendor._id, false, user);
    await expect(getUsableVendor(vendor._id)).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });
    await setVendorActive(vendor._id, true, user);
    expect((await getUsableVendor(vendor._id)).isActive).toBe(true);
  });

  it('deletes an unreferenced vendor and reports NOT_FOUND afterwards', async () => {
    const vendor = await createVendor({ name: 'Gone Co' }, user);
    await deleteVendor(vendor._id, user);
    expect(await PurchasingVendors.findOneAsync(vendor._id)).toBeUndefined();
    await expect(deleteVendor(vendor._id, user)).rejects.toMatchObject({
      extensions: { code: 'NOT_FOUND' },
    });
  });

  it('lists with search, active filter and paging', async () => {
    await PurchasingVendors.removeAsync({});
    await createVendor({ name: 'Alpha Mills', contactPerson: 'Zed' }, user);
    const beta = await createVendor({ name: 'Beta Mills' }, user);
    await createVendor({ name: 'Gamma' }, user);
    await setVendorActive(beta._id, false, user);

    expect((await listVendors({ search: 'mills' })).totalResults).toBe(2);
    expect((await listVendors({ search: 'zed' })).data).toHaveLength(1);
    expect((await listVendors({ isActive: true })).totalResults).toBe(2);
    const page = await listVendors({ pageIndex: 1, pageSize: 2 });
    expect(page.totalResults).toBe(3);
    expect(page.data.map((v) => v.name)).toEqual(['Gamma']);
  });

  it('treats search text literally, not as a pattern', async () => {
    await createVendor({ name: 'Regex Co' }, user);
    expect((await listVendors({ search: '.*' })).totalResults).toBe(0);
  });
});
