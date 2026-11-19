import { GraphQLError } from 'graphql';

import { CommitteeFeatureKeys } from 'meteor/idreesia-common/constants/organization';

import { getCommitteeAccess, type CommitteeAccessContext } from '../committee/access';

/**
 * That the committee has the Monitoring Profiles feature enabled. Who may call
 * the field is decided by `@checkCommitteeAccess` in the schema.
 */
export const assertMonitoringProfilesEnabled = (
  context: CommitteeAccessContext,
  committeeId: string
): void => {
  const { committee } = getCommitteeAccess(context, committeeId);
  const features = (committee.features as string[] | undefined) ?? [];
  if (!features.includes(CommitteeFeatureKeys.MONITORING_PROFILES)) {
    throw new GraphQLError(
      'Monitoring Profiles is not enabled for this committee.',
      { extensions: { code: 'FORBIDDEN' } }
    );
  }
};
