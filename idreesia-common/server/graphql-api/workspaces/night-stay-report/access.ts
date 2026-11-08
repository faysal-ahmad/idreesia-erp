import { GraphQLError } from 'graphql';

import { CommitteeFeatureKeys } from 'meteor/idreesia-common/constants/hr';

import { getMemberCommittee, type WorkspaceUser } from '../committee/access';

/**
 * Permission check for a committee's night stay report: the user must be a
 * member of the committee (erp-admin counts as one), and the committee must
 * have the Night Stay Report feature enabled.
 */
export const assertCanViewNightStayReport = async (
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
  if (!features.includes(CommitteeFeatureKeys.NIGHT_STAY_REPORT)) {
    throw new GraphQLError(
      'The Night Stay Report is not enabled for this committee.',
      { extensions: { code: 'FORBIDDEN' } }
    );
  }
};
