import {
  AuditLogs,
  type AuditLogDocument,
} from 'meteor/idreesia-common/server/collections/common';
import { forOwn, get } from 'meteor/idreesia-common/utilities/lodash';

export interface CreateAuditLogValues {
  entityId: string;
  entityType: string;
  operationType: string;
  auditValues?: Record<string, unknown>;
  operationBy: string;
  operationTime: Date;
}

export interface SearchAuditLogsParams {
  entityId?: string;
  entityTypes?: string[];
  fromTime?: Date;
  toTime?: Date;
  pageIndex?: string;
  pageSize?: string;
}

interface CountResult {
  total: number;
}

/**
 * The audit entries for changed values: one JSON string per field, holding
 * the value it changed from (read from the existing entity) and to. Fields
 * that are empty both before and after are skipped.
 */
export function getAuditValues(
  auditValues: Record<string, unknown>,
  existingEntity: Record<string, unknown> | null
): string[] {
  const entries: string[] = [];

  forOwn(auditValues, (value, key) => {
    const changedFrom = existingEntity ? get(existingEntity, key) : null;

    if (changedFrom || value) {
      entries.push(
        JSON.stringify({
          fieldName: key,
          changedFrom,
          changedTo: value,
        })
      );
    }
  });

  return entries;
}

/**
 * Records an audit log entry. When the existing entity is passed, the audit
 * values are stored as from/to pairs; otherwise they are stored as given.
 */
export async function createAuditLog(
  {
    entityId,
    entityType,
    operationType,
    auditValues,
    operationBy,
    operationTime,
  }: CreateAuditLogValues,
  existingEntity: Record<string, unknown> | null = null
): Promise<void> {
  await AuditLogs.insertAsync({
    entityId,
    entityType,
    operationType,
    operationBy,
    operationTime,
    auditValues:
      existingEntity && auditValues
        ? getAuditValues(auditValues, existingEntity)
        : auditValues,
  });
}

export function searchAuditLogs(params: SearchAuditLogsParams = {}) {
  const pipeline: Record<string, unknown>[] = [];

  const {
    entityId,
    entityTypes,
    fromTime,
    toTime,
    pageIndex = '0',
    pageSize = '20',
  } = params;

  if (entityId) {
    pipeline.push({
      $match: {
        entityId: { $eq: entityId },
      },
    });
  }

  if (entityTypes) {
    pipeline.push({
      $match: {
        entityType: { $in: entityTypes },
      },
    });
  }

  if (fromTime || toTime) {
    pipeline.push({
      $match: {
        operationTime: {
          ...(fromTime ? { $gte: fromTime } : {}),
          ...(toTime ? { $lte: toTime } : {}),
        },
      },
    });
  }

  const countingPipeline = pipeline.concat({
    $count: 'total',
  });

  const nPageIndex = parseInt(pageIndex, 10);
  const nPageSize = parseInt(pageSize, 10);
  const resultsPipeline = pipeline.concat([
    { $sort: { operationTime: -1 } },
    { $skip: nPageIndex * nPageSize },
    { $limit: nPageSize },
  ]);

  const auditLogs = AuditLogs.aggregate<AuditLogDocument>(resultsPipeline);
  const totalResults = AuditLogs.aggregate<CountResult>(countingPipeline);

  return Promise.all([auditLogs, totalResults]).then(results => ({
    data: results[0],
    totalResults: get(results[1], ['0', 'total'], 0),
  }));
}
