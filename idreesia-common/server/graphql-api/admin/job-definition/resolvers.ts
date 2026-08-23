import { CronExpressionParser } from 'cron-parser';

import agenda from 'meteor/idreesia-common/server/business-logic/jobs/agenda-instance';
import {
  JobDefinitions,
  type JobDefinitionDocument,
} from 'meteor/idreesia-common/server/collections/admin';
import { AuditLogs } from 'meteor/idreesia-common/server/collections/common';
import { EntityType, OperationType } from 'meteor/idreesia-common/constants/audit';

interface ResolverContext {
  user?: {
    _id: string;
  };
}

function requireUser(user: ResolverContext['user']) {
  if (!user) {
    throw new Error('User is required.');
  }
  return user;
}

async function requireJobDefinition(_id: string) {
  const definition = await JobDefinitions.findOneAsync(_id);
  if (!definition) {
    throw new Error('Job definition not found.');
  }
  return definition;
}

function assertValidCronExpression(schedule: string) {
  try {
    CronExpressionParser.parse(schedule);
  } catch {
    throw new Error(`"${schedule}" is not a valid cron expression.`);
  }
}

// Shared by updateJobDefinitionSchedule / clearJobDefinitionSchedule /
// resetJobDefinitionSchedule. A truthy schedule sets it (validated) and
// upserts the recurring job via agenda.every(); an empty one unsets the
// field entirely and cancels the recurring job outright - there's nothing
// left for setJobDefinitionEnabled to pause once there's no schedule.
async function applySchedule(
  _id: string,
  definition: JobDefinitionDocument,
  schedule: string | undefined,
  userId: string
) {
  if (schedule) {
    assertValidCronExpression(schedule);
    await JobDefinitions.updateAsync(_id, {
      $set: { schedule, updatedAt: new Date(), updatedBy: userId },
    });
    // Takes effect immediately, without a restart.
    await agenda.every(schedule, definition.name);
  } else {
    await JobDefinitions.updateAsync(_id, {
      $unset: { schedule: '' },
      $set: { updatedAt: new Date(), updatedBy: userId },
    });
    await agenda.cancel({ name: definition.name });
  }

  await AuditLogs.createAuditLog({
    entityId: _id,
    entityType: EntityType.JOB_DEFINITION,
    operationType: OperationType.JOB_SCHEDULE_UPDATED,
    operationBy: userId,
    operationTime: new Date(),
  });

  return JobDefinitions.findOneAsync(_id);
}

export default {
  Query: {
    allJobDefinitions: () =>
      JobDefinitions.find({}, { sort: { displayName: 1 } }).fetchAsync(),
  },

  Mutation: {
    updateJobDefinitionSchedule: async (
      _obj: unknown,
      { _id, schedule }: { _id: string; schedule: string },
      { user }: ResolverContext
    ) => {
      const _user = requireUser(user);
      const definition = await requireJobDefinition(_id);
      return applySchedule(_id, definition, schedule, _user._id);
    },

    clearJobDefinitionSchedule: async (
      _obj: unknown,
      { _id }: { _id: string },
      { user }: ResolverContext
    ) => {
      const _user = requireUser(user);
      const definition = await requireJobDefinition(_id);
      return applySchedule(_id, definition, undefined, _user._id);
    },

    resetJobDefinitionSchedule: async (
      _obj: unknown,
      { _id }: { _id: string },
      { user }: ResolverContext
    ) => {
      const _user = requireUser(user);
      const definition = await requireJobDefinition(_id);
      return applySchedule(_id, definition, definition.defaultSchedule, _user._id);
    },

    setJobDefinitionEnabled: async (
      _obj: unknown,
      { _id, enabled }: { _id: string; enabled: boolean },
      { user }: ResolverContext
    ) => {
      const _user = requireUser(user);
      const definition = await requireJobDefinition(_id);

      await JobDefinitions.updateAsync(_id, {
        $set: { enabled, updatedAt: new Date(), updatedBy: _user._id },
      });

      // Nothing recurring to pause/resume for a manual-only definition.
      if (definition.schedule) {
        if (enabled) {
          await agenda.enable({ name: definition.name });
        } else {
          await agenda.disable({ name: definition.name });
        }
      }

      await AuditLogs.createAuditLog({
        entityId: _id,
        entityType: EntityType.JOB_DEFINITION,
        operationType: enabled
          ? OperationType.JOB_ENABLED
          : OperationType.JOB_DISABLED,
        operationBy: _user._id,
        operationTime: new Date(),
      });

      return JobDefinitions.findOneAsync(_id);
    },
  },
};
