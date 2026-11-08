import { GraphQLError } from 'graphql';

import {
  CommitteeFeatureKeys,
  isCommitteeFeatureKey,
  type CommitteeFeatureKey,
} from 'meteor/idreesia-common/constants/hr';
import { Committees } from 'meteor/idreesia-common/server/collections/hr';

import { discussionsHandler } from './discussions';
import { documentsHandler } from './documents';
import { meetingsHandler } from './meetings';
import { pollsHandler } from './polls';
import { membersHandler } from './members-feature';
import { nightStayReportHandler } from './night-stay-report';
import { monitoringAlertsHandler } from './monitoring-alerts';
import { monitoringProfilesHandler } from './monitoring-profiles';
import type { CommitteeDoc, CommitteeFeatureHandler } from './types';

// Every feature needs a handler; the Record type makes a missing one a
// compile error when a feature is added to the constants.
const featureHandlers: Record<CommitteeFeatureKey, CommitteeFeatureHandler> = {
  [CommitteeFeatureKeys.MEMBERS]: membersHandler,
  [CommitteeFeatureKeys.DISCUSSIONS]: discussionsHandler,
  [CommitteeFeatureKeys.DOCUMENTS]: documentsHandler,
  [CommitteeFeatureKeys.MEETINGS]: meetingsHandler,
  [CommitteeFeatureKeys.POLLS]: pollsHandler,
  [CommitteeFeatureKeys.NIGHT_STAY_REPORT]: nightStayReportHandler,
  [CommitteeFeatureKeys.MONITORING_ALERTS]: monitoringAlertsHandler,
  [CommitteeFeatureKeys.MONITORING_PROFILES]: monitoringProfilesHandler,
};

const loadCommittee = async (
  committeeId: string,
  featureKey: string
): Promise<{ committee: CommitteeDoc; handler: CommitteeFeatureHandler }> => {
  if (!isCommitteeFeatureKey(featureKey)) {
    throw new GraphQLError(`Unknown committee feature '${featureKey}'.`, {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  const committee = (await Committees.findOneAsync(committeeId)) as
    | CommitteeDoc
    | undefined;
  if (!committee) {
    throw new GraphQLError('Committee not found.', {
      extensions: { code: 'NOT_FOUND' },
    });
  }

  return { committee, handler: featureHandlers[featureKey] };
};

// Runs a handler step, reporting failures (e.g. chat being unreachable) as a
// GraphQL error carrying the underlying message.
const runHandler = async (
  action: string,
  step: () => Promise<Record<string, unknown> | void>
) => {
  try {
    return (await step()) ?? {};
  } catch (error) {
    if (error instanceof GraphQLError) throw error;
    const reason = error instanceof Error ? error.message : String(error);
    throw new GraphQLError(`Could not ${action} the feature: ${reason}`, {
      extensions: { code: 'FEATURE_ACTION_FAILED' },
    });
  }
};

/**
 * Runs a member hook of every feature enabled on the committee, e.g. so the
 * discussion's chat group follows the committee's membership. Failures are
 * reported as a GraphQL error, before the membership itself changes.
 */
export const runMemberHooks = async (
  committee: CommitteeDoc,
  hook: 'memberAdded' | 'memberRemoved',
  karkunId: string
) => {
  for (const featureKey of committee.features ?? []) {
    if (!isCommitteeFeatureKey(featureKey)) continue;
    const handler = featureHandlers[featureKey];
    const run = handler[hook];
    if (!run) continue;
    try {
      await run.call(handler, committee, karkunId);
    } catch (error) {
      if (error instanceof GraphQLError) throw error;
      const reason = error instanceof Error ? error.message : String(error);
      const action =
        hook === 'memberAdded'
          ? 'add the member to the committee discussion'
          : 'remove the member from the committee discussion';
      throw new GraphQLError(`Could not ${action}: ${reason}`, {
        extensions: { code: 'FEATURE_ACTION_FAILED' },
      });
    }
  }
};

/**
 * Enables a feature for a committee: sets it up outside the ERP first, then
 * records it (and any data the feature keeps) on the committee. Enabling an
 * already enabled feature re-runs its setup, which is safe.
 */
export const enableCommitteeFeature = async (
  committeeId: string,
  featureKey: string,
  userId: string
): Promise<true> => {
  const { committee, handler } = await loadCommittee(committeeId, featureKey);
  const featureData = await runHandler('enable', () =>
    handler.enable(committee, userId)
  );

  await Committees.updateAsync(committeeId, {
    $addToSet: { features: featureKey },
    $set: { ...featureData, updatedAt: new Date(), updatedBy: userId },
  });

  return true;
};

/**
 * Disables a feature for a committee. The feature's stored data (e.g. the
 * chat group id) is kept so a later enable can pick up where it left off.
 */
export const disableCommitteeFeature = async (
  committeeId: string,
  featureKey: string,
  userId: string
): Promise<true> => {
  const { committee, handler } = await loadCommittee(committeeId, featureKey);
  const featureData = await runHandler('disable', () =>
    handler.disable(committee, userId)
  );

  await Committees.updateAsync(committeeId, {
    $pull: { features: featureKey },
    $set: { ...featureData, updatedAt: new Date(), updatedBy: userId },
  });

  return true;
};
