import { useEffect, useState } from 'react';
import { useApolloClient } from '@apollo/client/react';

import { CommitteeFeatureKeys } from 'meteor/idreesia-common/constants/organization';
import { useCurrentUser } from '../hooks/use-current-user';
import { MOBILE_WORKSPACE_COMMITTEE_MEMBERS } from './members/gql';

const OTHER_ROLES = ['guest', 'observer'];

/**
 * Ids of the committees where the signed-in user is only a guest or observer.
 * `myCommittees` doesn't say which role the user has, so each committee's
 * member list is read (the Members screen's query, shared through the Apollo
 * cache) and the user's own entry is looked up. A committee whose members
 * can't be read (Members feature off, or the user isn't listed, e.g. an
 * admin) is treated as a regular workspace.
 */
export const useOtherWorkspaceIds = (
  committees: { _id: string; features?: (string | null)[] | null }[],
  refreshKey: number,
): { otherIds: Set<string>; rolesLoading: boolean } => {
  const client = useApolloClient();
  const { user } = useCurrentUser();
  const karkunId = user?.karkun?._id ?? null;
  const [otherIds, setOtherIds] = useState<Set<string>>(new Set());
  const [rolesLoading, setRolesLoading] = useState(false);

  // A stable signature, so a new array with the same committees doesn't refire.
  const signature = committees
    .filter(committee => committee.features?.includes(CommitteeFeatureKeys.MEMBERS))
    .map(committee => committee._id)
    .join(',');

  useEffect(() => {
    if (!karkunId || !signature) {
      setOtherIds(new Set());
      return undefined;
    }
    let cancelled = false;
    setRolesLoading(true);
    Promise.all(
      signature.split(',').map(committeeId =>
        client
          .query({
            query: MOBILE_WORKSPACE_COMMITTEE_MEMBERS,
            variables: { committeeId },
            fetchPolicy: refreshKey > 0 ? 'network-only' : 'cache-first',
          })
          .then(result => {
            const me = result.data?.workspaceCommitteeById?.members?.find(
              member => member?.karkunId === karkunId,
            );
            return me && OTHER_ROLES.includes(me.role ?? '') ? committeeId : null;
          })
          .catch(() => null),
      ),
    ).then(ids => {
      if (cancelled) return;
      setOtherIds(new Set(ids.filter((id): id is string => id != null)));
      setRolesLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [client, karkunId, signature, refreshKey]);

  return { otherIds, rolesLoading };
};
