import type { JobState, LogLevel, JobLogEvent } from 'agenda';

import agenda from 'meteor/idreesia-common/server/business-logic/jobs/agenda-instance';
import { AuditLogs } from 'meteor/idreesia-common/server/collections/common';
import { EntityType, OperationType } from 'meteor/idreesia-common/constants/audit';

interface ResolverContext {
  user?: {
    _id: string;
  };
}

interface ScheduledJobsFilter {
  name?: string;
  status?: string;
  pageIndex?: string;
  pageSize?: string;
}

interface JobLogsFilter {
  jobName?: string;
  level?: string;
  event?: string;
  pageIndex?: string;
  pageSize?: string;
}

function requireUser(user: ResolverContext['user']) {
  if (!user) {
    throw new Error('User is required.');
  }
  return user;
}

function requireActiveProcessor() {
  if (!agenda.isActiveJobProcessor()) {
    throw new Error(
      'The job processor is not running (JOBS_ENABLED is off), so this would never actually run. Enable it and restart the server first.'
    );
  }
}

// Lower sorts first - scheduled/waiting/in-progress jobs ahead of finished ones.
const STATE_SORT_PRIORITY: Record<JobState, number> = {
  running: 0,
  queued: 1,
  scheduled: 2,
  repeating: 3,
  paused: 4,
  failed: 5,
  completed: 6,
};

export default {
  Query: {
    pagedScheduledJobs: async (
      _obj: unknown,
      { filter }: { filter?: ScheduledJobsFilter }
    ) => {
      const { name, status, pageIndex = '0', pageSize = '20' } = filter ?? {};
      const nPageIndex = parseInt(pageIndex, 10);
      const nPageSize = parseInt(pageSize, 10);

      // Fetched unpaginated (no skip/limit) so active jobs can be grouped ahead
      // of completed ones across the whole result set, not just within a
      // single page - state is only computed after queryJobs() runs, so a
      // DB-level skip/limit would slice the data before state is even known.
      const { jobs, total } = await agenda.queryJobs({
        name: name || undefined,
        state: (status || undefined) as JobState | undefined,
        sort: { nextRunAt: 'desc' },
      });

      const sortedJobs = [...jobs].sort((a, b) => {
        const priorityDiff =
          STATE_SORT_PRIORITY[a.state] - STATE_SORT_PRIORITY[b.state];
        if (priorityDiff !== 0) return priorityDiff;
        return (b.nextRunAt?.getTime() ?? 0) - (a.nextRunAt?.getTime() ?? 0);
      });

      const pageStart = nPageIndex * nPageSize;
      const pageJobs = sortedJobs.slice(pageStart, pageStart + nPageSize);

      return {
        totalResults: total,
        data: pageJobs.map(job => ({
          _id: job._id,
          name: job.name,
          status: job.state,
          progress: job.progress,
          nextRunAt: job.nextRunAt,
          lastRunAt: job.lastRunAt,
          lastFinishedAt: job.lastFinishedAt,
          failedAt: job.failedAt,
          failReason: job.failReason,
          failCount: job.failCount,
          repeatInterval: job.repeatInterval,
          disabled: job.disabled,
        })),
      };
    },

    pagedJobLogs: async (
      _obj: unknown,
      { filter }: { filter?: JobLogsFilter }
    ) => {
      const {
        jobName,
        level,
        event,
        pageIndex = '0',
        pageSize = '20',
      } = filter ?? {};
      const nPageIndex = parseInt(pageIndex, 10);
      const nPageSize = parseInt(pageSize, 10);

      const { entries, total } = await agenda.getLogs({
        jobName: jobName || undefined,
        level: (level || undefined) as LogLevel | undefined,
        event: (event || undefined) as JobLogEvent | undefined,
        sort: 'desc',
        offset: nPageIndex * nPageSize,
        limit: nPageSize,
      });

      return {
        totalResults: total,
        data: entries,
      };
    },

    isJobProcessorActive: () => agenda.isActiveJobProcessor(),
  },

  Mutation: {
    runScheduledJobNow: async (
      _obj: unknown,
      { name }: { name: string },
      { user }: ResolverContext
    ) => {
      const _user = requireUser(user);
      requireActiveProcessor();

      // Creates a NEW job document - this does not re-run any specific
      // existing row from the list, it enqueues a fresh immediate run of
      // the named job. See retryFailedJob for re-running a specific row.
      await agenda.now(name);

      await AuditLogs.createAuditLog({
        entityId: name,
        entityType: EntityType.SCHEDULED_JOB,
        operationType: OperationType.JOB_RUN_NOW,
        operationBy: _user._id,
        operationTime: new Date(),
      });

      return true;
    },

    retryFailedJob: async (
      _obj: unknown,
      { _id }: { _id: string },
      { user }: ResolverContext
    ) => {
      const _user = requireUser(user);
      requireActiveProcessor();
      const job = await agenda.db.getJobById(_id);
      if (!job) {
        throw new Error('Job not found.');
      }

      // Updates this exact job document in place (clearing the failure and
      // making it due immediately) rather than creating a new one.
      await agenda.db.saveJob(
        {
          ...job,
          nextRunAt: new Date(),
          lockedAt: undefined,
          failedAt: undefined,
          failReason: undefined,
        },
        undefined
      );

      await AuditLogs.createAuditLog({
        entityId: _id,
        entityType: EntityType.SCHEDULED_JOB,
        operationType: OperationType.JOB_RETRY,
        operationBy: _user._id,
        operationTime: new Date(),
      });

      return true;
    },

    setScheduledJobEnabled: async (
      _obj: unknown,
      { _id, enabled }: { _id: string; enabled: boolean },
      { user }: ResolverContext
    ) => {
      const _user = requireUser(user);

      if (enabled) {
        await agenda.enable({ id: _id });
      } else {
        await agenda.disable({ id: _id });
      }

      await AuditLogs.createAuditLog({
        entityId: _id,
        entityType: EntityType.SCHEDULED_JOB,
        operationType: enabled ? OperationType.JOB_ENABLED : OperationType.JOB_DISABLED,
        operationBy: _user._id,
        operationTime: new Date(),
      });

      return true;
    },
  },
};
