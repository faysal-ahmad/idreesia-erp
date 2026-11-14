import { GraphQLError } from 'graphql';

import { CommitteeFeatureKeys } from 'meteor/idreesia-common/constants/organization';

import { getMemberCommittee, type WorkspaceUser } from '../committee/access';

/**
 * Permission check for a committee's Monitoring Alerts: the user must
 * be a member of the committee (erp-admin counts as one), and the committee
 * must have the Monitoring Alerts feature enabled.
 */
export const assertCanViewMonitoringAlerts = async (
  user: WorkspaceUser | null | undefined,
  committeeId: string
): Promise<void> => {
  const committee = await getMemberCommittee(user, committeeId);
  if (!committee) {
    throw new GraphQLError('You are not a member of this committee.', {
      extensions: { code: 'FORBIDDEN' },
    });
  }

  const features = (committee.features as string[] | undefined) ?? [];
  if (!features.includes(CommitteeFeatureKeys.MONITORING_ALERTS)) {
    throw new GraphQLError(
      'Monitoring Alerts is not enabled for this committee.',
      { extensions: { code: 'FORBIDDEN' } }
    );
  }
};
