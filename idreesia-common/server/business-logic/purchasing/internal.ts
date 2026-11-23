import { Random } from 'meteor/random';

import { EntityType, OperationType } from 'meteor/idreesia-common/constants/audit';
import { MAX_LINES, MAX_NAME_LENGTH } from 'meteor/idreesia-common/constants/purchasing';
import { PurchasingCatalogItems } from 'meteor/idreesia-common/server/collections/purchasing';

import { createAuditLog } from '../common/audit-logs';
import { purchasingError } from './errors';

export interface ActingUser {
  _id: string;
}

type AuditEntityType = (typeof EntityType)[keyof typeof EntityType];

// Anything with the collection methods this module uses.
interface VersionedCollection {
  updateAsync(selector: object, modifier: object): Promise<number>;
}

export interface Page<T> {
  totalResults: number;
  data: T[];
}

export interface PageOptions {
  pageIndex?: number;
  pageSize?: number;
}

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 200;

export function pageWindow({ pageIndex = 0, pageSize = DEFAULT_PAGE_SIZE }: PageOptions) {
  const limit = Math.min(Math.max(1, Math.trunc(pageSize)), MAX_PAGE_SIZE);
  return { skip: Math.max(0, Math.trunc(pageIndex)) * limit, limit };
}

// ---------------------------------------------------------------------------
// Numbers and text
// ---------------------------------------------------------------------------

/** Money is kept to two decimals; this stops float noise from adding up. */
export const roundMoney = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

/** Quantities allow up to three decimals (e.g. 2.5 kg). */
export const roundQuantity = (value: number) =>
  Math.round((value + Number.EPSILON) * 1000) / 1000;

/** Trims text and turns blanks into undefined. */
export const cleanText = (value?: string | null): string | undefined => {
  const text = value?.trim();
  return text || undefined;
};

/** A required single-line text: trimmed, whitespace collapsed, bounded. */
export function requireText(
  value: string | null | undefined,
  what: string,
  maxLength = MAX_NAME_LENGTH
): string {
  const text = (value ?? '').trim().replace(/\s+/g, ' ');
  if (!text) throw purchasingError('BAD_USER_INPUT', `${what} is required.`);
  if (text.length > maxLength) {
    throw purchasingError('BAD_USER_INPUT', `${what} is too long.`);
  }
  return text;
}

export function requireNonNegative(value: number | null | undefined, what: string) {
  if (value == null) return 0;
  if (!Number.isFinite(value) || value < 0) {
    throw purchasingError('BAD_USER_INPUT', `${what} must not be negative.`);
  }
  return value;
}

// ---------------------------------------------------------------------------
// Lines
// ---------------------------------------------------------------------------

export interface LineInput {
  _id?: string | null;
  catalogItemId?: string | null;
  description?: string | null;
  unit?: string | null;
  quantity: number;
}

export interface BaseLine {
  _id: string;
  catalogItemId?: string;
  description: string;
  unit: string;
  quantity: number;
}

/**
 * Validates the part of a line every document shares. When the line names a
 * catalog item, a blank description or unit is filled in from the item;
 * free-text lines (no catalog item) need both.
 */
export async function normalizeBaseLine(
  input: LineInput,
  position: number
): Promise<BaseLine> {
  const where = `Line ${position + 1}`;
  const catalogItemId = cleanText(input.catalogItemId);
  let description = cleanText(input.description);
  let unit = cleanText(input.unit);

  if (catalogItemId) {
    const item = await PurchasingCatalogItems.findOneAsync({
      _id: { $eq: catalogItemId },
    });
    if (!item) {
      throw purchasingError('BAD_USER_INPUT', `${where}: catalog item not found.`);
    }
    description = description ?? item.name;
    unit = unit ?? item.unit;
  }

  const quantity = input.quantity;
  if (!Number.isFinite(quantity) || quantity <= 0) {
    throw purchasingError(
      'BAD_USER_INPUT',
      `${where}: the quantity must be more than zero.`
    );
  }

  return {
    _id: cleanText(input._id) ?? Random.id(),
    ...(catalogItemId ? { catalogItemId } : {}),
    description: requireText(description, `${where}: description`),
    unit: requireText(unit, `${where}: unit`, 50),
    quantity: roundQuantity(quantity),
  };
}

export function assertLineCount(lines: unknown[], { allowEmpty = false } = {}) {
  if (lines.length > MAX_LINES) {
    throw purchasingError(
      'BAD_USER_INPUT',
      `A document can have at most ${MAX_LINES} lines.`
    );
  }
  if (!allowEmpty && lines.length === 0) {
    throw purchasingError('BAD_USER_INPUT', 'Add at least one line.');
  }
}

export interface PricedLine {
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

/** Subtotal, tax and total (before any discount or shipping) of the lines. */
export function totalsOf(lines: PricedLine[]) {
  let subtotal = 0;
  let taxTotal = 0;
  lines.forEach((line) => {
    const net = roundMoney(line.quantity * line.unitPrice);
    subtotal += net;
    taxTotal += roundMoney((net * line.taxRate) / 100);
  });
  subtotal = roundMoney(subtotal);
  taxTotal = roundMoney(taxTotal);
  return { subtotal, taxTotal, total: roundMoney(subtotal + taxTotal) };
}

export function requireTaxRate(value: number | null | undefined) {
  const rate = value ?? 0;
  if (!Number.isFinite(rate) || rate < 0 || rate > 100) {
    throw purchasingError('BAD_USER_INPUT', 'A tax rate must be between 0 and 100.');
  }
  return rate;
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

/** Records a change to a purchasing document in the audit log. */
export async function audit(
  entityType: AuditEntityType,
  entityId: string,
  operationType: string,
  auditValues: Record<string, unknown> | undefined,
  user: ActingUser,
  existing: object | null = null
) {
  await createAuditLog(
    {
      entityId,
      entityType,
      operationType,
      auditValues,
      operationBy: user._id,
      operationTime: new Date(),
    },
    existing as Record<string, unknown> | null
  );
}

export { EntityType, OperationType };

/**
 * Changes a document only if nobody changed it since it was read. Bumps the
 * version, and the update fields' audit stamps.
 */
export async function updateIfUnchanged(
  collection: VersionedCollection,
  _id: string,
  version: number,
  fields: Record<string, unknown>,
  user: ActingUser,
  unset: string[] = []
) {
  const modifier: Record<string, unknown> = {
    $set: { ...fields, updatedAt: new Date(), updatedBy: user._id },
    $inc: { version: 1 },
  };
  if (unset.length) {
    modifier.$unset = Object.fromEntries(unset.map((field) => [field, '']));
  }
  const changed = await collection.updateAsync(
    { _id: { $eq: _id }, version: { $eq: version } },
    modifier
  );
  if (!changed) {
    throw purchasingError(
      'CONFLICT',
      'This document was changed by someone else. Reload and try again.'
    );
  }
}

/**
 * Moves a document to a new status only if it is still in one of the
 * expected statuses. The check and the change are one update, so two people
 * acting at once can't both succeed.
 */
export async function moveStatus(
  collection: VersionedCollection,
  _id: string,
  from: string[],
  fields: Record<string, unknown>,
  user: ActingUser,
  what: string
) {
  const changed = await collection.updateAsync(
    { _id: { $eq: _id }, status: { $in: from } },
    {
      $set: { ...fields, updatedAt: new Date(), updatedBy: user._id },
      $inc: { version: 1 },
    }
  );
  if (!changed) {
    throw purchasingError(
      'CONFLICT',
      `${what} is no longer in a state where this can be done. Reload and try again.`
    );
  }
}

/** The date `days` after `date`. */
export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * A date from a GraphQL string: milliseconds since the epoch (what the web
 * app sends) or an ISO date. Blank is "no date".
 */
export function parseDateInput(value?: string | null): Date | undefined {
  const text = value?.trim();
  if (!text) return undefined;
  const date = /^\d+$/.test(text) ? new Date(Number(text)) : new Date(text);
  if (Number.isNaN(date.getTime())) {
    throw purchasingError('BAD_USER_INPUT', 'That date is not valid.');
  }
  return date;
}

/** Like parseDateInput, for a date that must be given. */
export function requireDateInput(value: string | null | undefined, what: string): Date {
  const date = parseDateInput(value);
  if (!date) throw purchasingError('BAD_USER_INPUT', `${what} is required.`);
  return date;
}
