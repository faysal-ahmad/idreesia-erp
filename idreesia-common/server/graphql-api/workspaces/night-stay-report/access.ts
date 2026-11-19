import { GraphQLError } from 'graphql';

import { CommitteeFeatureKeys } from 'meteor/idreesia-common/constants/organization';

import { getCommitteeAccess, type CommitteeAccessContext } from '../committee/access';

/**
 * That the committee has the Night Stay Report feature enabled. Who may call
 * the field is decided by `@checkCommitteeAccess` in the schema.
 */
export const assertNightStayReportEnabled = (
  context: CommitteeAccessContext,
  committeeId: string
): void => {
  const { committee } = getCommitteeAccess(context, committeeId);
  const features = (committee.features as string[] | undefined) ?? [];
  if (!features.includes(CommitteeFeatureKeys.NIGHT_STAY_REPORT)) {
    throw new GraphQLError(
      'Night Stay Report is not enabled for this committee.',
      { extensions: { code: 'FORBIDDEN' } }
    );
  }
};
