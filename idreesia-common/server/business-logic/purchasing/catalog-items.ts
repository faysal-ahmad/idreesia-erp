import { EntityType, OperationType } from 'meteor/idreesia-common/constants/audit';
import { MAX_NAME_LENGTH } from 'meteor/idreesia-common/constants/purchasing';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  PurchasingCatalogItems,
  PurchasingInvoices,
  PurchasingOrders,
  PurchasingQuotes,
  PurchasingRequisitions,
  type PurchasingCatalogItemDocument,
} from 'meteor/idreesia-common/server/collections/purchasing';
import { escapeRegExp } from 'meteor/idreesia-common/utilities/lodash';

import { createAuditLog } from '../common/audit-logs';
import { removeCatalogItemImageFiles } from './catalog-item-images';
import { purchasingError } from './errors';

export interface CatalogItemValues {
  name: string;
  unit: string;
  category?: string;
  company?: string;
  description?: string;
  defaultUnitPrice?: number;
}

export interface ListCatalogItemsOptions {
  search?: string;
  isActive?: boolean;
  pageIndex?: number;
  pageSize?: number;
}

interface ActingUser {
  _id: string;
}

const clean = (text?: string) => text?.trim().replace(/\s+/g, ' ') || undefined;

/** Trims text, turns blanks into undefined and validates the values. */
function normalize(values: CatalogItemValues): CatalogItemValues {
  const name = clean(values.name);
  const unit = clean(values.unit);
  if (!name) throw purchasingError('BAD_USER_INPUT', 'An item needs a name.');
  if (name.length > MAX_NAME_LENGTH) {
    throw purchasingError('BAD_USER_INPUT', 'The item name is too long.');
  }
  if (!unit) throw purchasingError('BAD_USER_INPUT', 'An item needs a unit.');
  if (
    values.defaultUnitPrice != null &&
    (!Number.isFinite(values.defaultUnitPrice) || values.defaultUnitPrice < 0)
  ) {
    throw purchasingError('BAD_USER_INPUT', 'The price must not be negative.');
  }

  const result: CatalogItemValues = { name, unit };
  const category = clean(values.category);
  const company = clean(values.company);
  if (company && company.length > MAX_NAME_LENGTH) {
    throw purchasingError('BAD_USER_INPUT', 'The company name is too long.');
  }
  const description = values.description?.trim();
  if (category) result.category = category;
  if (company) result.company = company;
  if (description) result.description = description;
  if (values.defaultUnitPrice != null) {
    result.defaultUnitPrice = values.defaultUnitPrice;
  }
  return result;
}

async function assertNameFree(name: string, exceptId?: string) {
  const existing = await PurchasingCatalogItems.findOneAsync({
    name: { $regex: new RegExp(`^${escapeRegExp(name)}$`, 'i') },
    ...(exceptId ? { _id: { $ne: exceptId } } : {}),
  });
  if (existing) {
    throw purchasingError(
      'CONFLICT',
      'A catalog item with this name already exists.'
    );
  }
}

export async function getCatalogItem(
  _id: string
): Promise<PurchasingCatalogItemDocument> {
  const item = await PurchasingCatalogItems.findOneAsync({ _id: { $eq: _id } });
  if (!item) throw purchasingError('NOT_FOUND', 'Catalog item not found.');
  return item;
}

export async function createCatalogItem(
  values: CatalogItemValues,
  user: ActingUser
): Promise<PurchasingCatalogItemDocument> {
  const data = normalize(values);
  return runInTransaction(async () => {
    await assertNameFree(data.name);
    const now = new Date();
    const _id = await PurchasingCatalogItems.insertAsync({
      ...data,
      isActive: true,
      createdAt: now,
      createdBy: user._id,
      updatedAt: now,
      updatedBy: user._id,
    });
    await createAuditLog({
      entityId: _id,
      entityType: EntityType.PURCHASING_CATALOG_ITEM,
      operationType: OperationType.CREATE,
      auditValues: { ...data },
      operationBy: user._id,
      operationTime: now,
    });
    return getCatalogItem(_id);
  });
}

export async function updateCatalogItem(
  _id: string,
  values: CatalogItemValues,
  user: ActingUser
): Promise<PurchasingCatalogItemDocument> {
  const data = normalize(values);
  return runInTransaction(async () => {
    const existing = await getCatalogItem(_id);
    await assertNameFree(data.name, _id);

    const $set: Record<string, unknown> = {
      name: data.name,
      unit: data.unit,
      updatedAt: new Date(),
      updatedBy: user._id,
    };
    const $unset: Record<string, ''> = {};
    (['category', 'company', 'description', 'defaultUnitPrice'] as const).forEach(
      (field) => {
        if (data[field] !== undefined) $set[field] = data[field];
        else $unset[field] = '';
      }
    );

    await PurchasingCatalogItems.updateAsync(
      { _id: { $eq: _id } },
      Object.keys($unset).length ? { $set, $unset } : { $set }
    );
    await createAuditLog(
      {
        entityId: _id,
        entityType: EntityType.PURCHASING_CATALOG_ITEM,
        operationType: OperationType.UPDATE,
        auditValues: { ...data },
        operationBy: user._id,
        operationTime: new Date(),
      },
      existing as unknown as Record<string, unknown>
    );
    return getCatalogItem(_id);
  });
}

export async function setCatalogItemActive(
  _id: string,
  isActive: boolean,
  user: ActingUser
): Promise<PurchasingCatalogItemDocument> {
  return runInTransaction(async () => {
    const existing = await getCatalogItem(_id);
    if (existing.isActive === isActive) return existing;
    const now = new Date();
    await PurchasingCatalogItems.updateAsync(
      { _id: { $eq: _id } },
      { $set: { isActive, updatedAt: now, updatedBy: user._id } }
    );
    await createAuditLog(
      {
        entityId: _id,
        entityType: EntityType.PURCHASING_CATALOG_ITEM,
        operationType: OperationType.UPDATE,
        auditValues: { isActive },
        operationBy: user._id,
        operationTime: now,
      },
      existing as unknown as Record<string, unknown>
    );
    return getCatalogItem(_id);
  });
}

/** How many purchasing documents have a line for the item. */
export async function countCatalogItemReferences(
  itemId: string
): Promise<number> {
  const counts = await Promise.all(
    [
      PurchasingRequisitions,
      PurchasingQuotes,
      PurchasingOrders,
      PurchasingInvoices,
    ].map((collection) =>
      collection
        .find({ lines: { $elemMatch: { internalCatalogId: itemId } } })
        .countAsync()
    )
  );
  return counts.reduce((sum, count) => sum + count, 0);
}

/** Deletes an item no line refers to; otherwise it can only be deactivated. */
export async function deleteCatalogItem(
  _id: string,
  user: ActingUser
): Promise<void> {
  await runInTransaction(async () => {
    const existing = await getCatalogItem(_id);
    if ((await countCatalogItemReferences(_id)) > 0) {
      throw purchasingError(
        'CONFLICT',
        'This item is used by purchasing documents. Deactivate it instead.'
      );
    }
    await PurchasingCatalogItems.removeAsync({ _id: { $eq: _id } });
    await createAuditLog({
      entityId: _id,
      entityType: EntityType.PURCHASING_CATALOG_ITEM,
      operationType: OperationType.DELETE,
      operationBy: user._id,
      operationTime: new Date(),
    });
    await removeCatalogItemImageFiles(existing);
  });
}

export async function listCatalogItems({
  search,
  isActive,
  pageIndex = 0,
  pageSize = 20,
}: ListCatalogItemsOptions = {}) {
  const selector: Record<string, unknown> = {};
  const text = search?.trim();
  if (text) {
    const regex = new RegExp(escapeRegExp(text), 'i');
    selector.$or = [{ name: regex }, { category: regex }, { company: regex }];
  }
  if (isActive !== undefined && isActive !== null) selector.isActive = isActive;

  const [totalResults, data] = await Promise.all([
    PurchasingCatalogItems.find(selector).countAsync(),
    PurchasingCatalogItems.find(selector, {
      sort: { name: 1 },
      skip: Math.max(0, pageIndex) * pageSize,
      limit: Math.min(Math.max(1, pageSize), 200),
    }).fetchAsync(),
  ]);
  return { totalResults, data };
}
