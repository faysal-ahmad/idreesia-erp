import { EntityType, OperationType } from 'meteor/idreesia-common/constants/audit';
import { MAX_NAME_LENGTH } from 'meteor/idreesia-common/constants/purchasing';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  PurchasingInvoices,
  PurchasingOrders,
  PurchasingPayments,
  PurchasingQuotes,
  PurchasingReceipts,
  PurchasingVendors,
  type PurchasingVendorDocument,
} from 'meteor/idreesia-common/server/collections/purchasing';
import { escapeRegExp } from 'meteor/idreesia-common/utilities/lodash';

import { createAuditLog } from '../common/audit-logs';
import { purchasingError } from './errors';

export interface VendorValues {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  paymentTermsDays?: number;
  bankName?: string;
  bankAccountTitle?: string;
  bankAccountNumber?: string;
  notes?: string;
}

export interface ListVendorsOptions {
  search?: string;
  isActive?: boolean;
  pageIndex?: number;
  pageSize?: number;
}

interface ActingUser {
  _id: string;
}

const TEXT_FIELDS = [
  'contactPerson',
  'phone',
  'email',
  'address',
  'taxId',
  'bankName',
  'bankAccountTitle',
  'bankAccountNumber',
  'notes',
] as const;

/** Trims text, turns blanks into undefined and validates the name. */
function normalize(values: VendorValues): VendorValues {
  const name = (values.name ?? '').trim().replace(/\s+/g, ' ');
  if (!name) throw purchasingError('BAD_USER_INPUT', 'A vendor needs a name.');
  if (name.length > MAX_NAME_LENGTH) {
    throw purchasingError('BAD_USER_INPUT', 'The vendor name is too long.');
  }
  if (
    values.paymentTermsDays != null &&
    (!Number.isInteger(values.paymentTermsDays) || values.paymentTermsDays < 0)
  ) {
    throw purchasingError(
      'BAD_USER_INPUT',
      'Payment terms must be a whole number of days.'
    );
  }

  const result: VendorValues = { name };
  TEXT_FIELDS.forEach((field) => {
    const text = values[field]?.trim();
    if (text) result[field] = text;
  });
  if (values.paymentTermsDays != null) {
    result.paymentTermsDays = values.paymentTermsDays;
  }
  return result;
}

async function assertNameFree(name: string, exceptId?: string) {
  const existing = await PurchasingVendors.findOneAsync({
    name: { $regex: new RegExp(`^${escapeRegExp(name)}$`, 'i') },
    ...(exceptId ? { _id: { $ne: exceptId } } : {}),
  });
  if (existing) {
    throw purchasingError('CONFLICT', 'A vendor with this name already exists.');
  }
}

export async function getVendor(_id: string): Promise<PurchasingVendorDocument> {
  const vendor = await PurchasingVendors.findOneAsync({ _id: { $eq: _id } });
  if (!vendor) throw purchasingError('NOT_FOUND', 'Vendor not found.');
  return vendor;
}

/**
 * Loads a vendor that a new document is about to use. An inactive vendor
 * can't be picked for new documents.
 */
export async function getUsableVendor(
  _id: string
): Promise<PurchasingVendorDocument> {
  const vendor = await getVendor(_id);
  if (!vendor.isActive) {
    throw purchasingError('BAD_USER_INPUT', 'This vendor is inactive.');
  }
  return vendor;
}

export async function createVendor(
  values: VendorValues,
  user: ActingUser
): Promise<PurchasingVendorDocument> {
  const clean = normalize(values);
  return runInTransaction(async () => {
    await assertNameFree(clean.name);
    const now = new Date();
    const _id = await PurchasingVendors.insertAsync({
      ...clean,
      isActive: true,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });
    await createAuditLog({
      entityId: _id,
      entityType: EntityType.PURCHASING_VENDOR,
      operationType: OperationType.CREATE,
      auditValues: { ...clean },
      operationBy: user._id,
      operationTime: now,
    });
    return getVendor(_id);
  });
}

export async function updateVendor(
  _id: string,
  values: VendorValues,
  user: ActingUser
): Promise<PurchasingVendorDocument> {
  const clean = normalize(values);
  return runInTransaction(async () => {
    const existing = await getVendor(_id);
    await assertNameFree(clean.name, _id);

    // Blank optional fields are cleared.
    const $set: Record<string, unknown> = {
      name: clean.name,
      updatedAt: new Date(),
      updatedBy: user._id,
    };
    const $unset: Record<string, ''> = {};
    [...TEXT_FIELDS, 'paymentTermsDays' as const].forEach((field) => {
      if (clean[field] !== undefined) $set[field] = clean[field];
      else $unset[field] = '';
    });

    await PurchasingVendors.updateAsync(
      { _id: { $eq: _id } },
      Object.keys($unset).length ? { $set, $unset } : { $set }
    );
    await createAuditLog(
      {
        entityId: _id,
        entityType: EntityType.PURCHASING_VENDOR,
        operationType: OperationType.UPDATE,
        auditValues: { ...clean },
        operationBy: user._id,
        operationTime: new Date(),
      },
      existing as unknown as Record<string, unknown>
    );
    return getVendor(_id);
  });
}

export async function setVendorActive(
  _id: string,
  isActive: boolean,
  user: ActingUser
): Promise<PurchasingVendorDocument> {
  return runInTransaction(async () => {
    const existing = await getVendor(_id);
    if (existing.isActive === isActive) return existing;
    const now = new Date();
    await PurchasingVendors.updateAsync(
      { _id: { $eq: _id } },
      { $set: { isActive, updatedAt: now, updatedBy: user._id } }
    );
    await createAuditLog(
      {
        entityId: _id,
        entityType: EntityType.PURCHASING_VENDOR,
        operationType: OperationType.UPDATE,
        auditValues: { isActive },
        operationBy: user._id,
        operationTime: now,
      },
      existing as unknown as Record<string, unknown>
    );
    return getVendor(_id);
  });
}

/** How many purchasing documents refer to the vendor. */
export async function countVendorReferences(vendorId: string): Promise<number> {
  const counts = await Promise.all(
    [
      PurchasingQuotes,
      PurchasingOrders,
      PurchasingReceipts,
      PurchasingInvoices,
      PurchasingPayments,
    ].map((collection) =>
      collection.find({ vendorId: { $eq: vendorId } }).countAsync()
    )
  );
  return counts.reduce((sum, count) => sum + count, 0);
}

/** Deletes a vendor nobody refers to; otherwise it can only be deactivated. */
export async function deleteVendor(
  _id: string,
  user: ActingUser
): Promise<void> {
  await runInTransaction(async () => {
    await getVendor(_id);
    if ((await countVendorReferences(_id)) > 0) {
      throw purchasingError(
        'CONFLICT',
        'This vendor is used by purchasing documents. Deactivate it instead.'
      );
    }
    await PurchasingVendors.removeAsync({ _id: { $eq: _id } });
    await createAuditLog({
      entityId: _id,
      entityType: EntityType.PURCHASING_VENDOR,
      operationType: OperationType.DELETE,
      operationBy: user._id,
      operationTime: new Date(),
    });
  });
}

export async function listVendors({
  search,
  isActive,
  pageIndex = 0,
  pageSize = 20,
}: ListVendorsOptions = {}) {
  const selector: Record<string, unknown> = {};
  const text = search?.trim();
  if (text) {
    const regex = new RegExp(escapeRegExp(text), 'i');
    selector.$or = [{ name: regex }, { contactPerson: regex }, { phone: regex }];
  }
  if (isActive !== undefined && isActive !== null) selector.isActive = isActive;

  const [totalResults, data] = await Promise.all([
    PurchasingVendors.find(selector).countAsync(),
    PurchasingVendors.find(selector, {
      sort: { name: 1 },
      skip: Math.max(0, pageIndex) * pageSize,
      limit: Math.min(Math.max(1, pageSize), 200),
    }).fetchAsync(),
  ]);
  return { totalResults, data };
}
