import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Button, Dialog, List, PullToRefresh, Tag } from 'antd-mobile';
import { UserAddOutline } from 'antd-mobile-icons';

import { MehfilPermissionsPermissions } from 'meteor/idreesia-common/constants/mehfil-permissions';
import type { MobileMehfilPermissionsQuery } from 'meteor/idreesia-common/types/client-operations';
import { useOnlineStatus } from '../../hooks';
import { Page, PageEmpty, PageError, PageLoading, showError, showSuccess } from '../../layout';
import { useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import {
  MOBILE_ADD_MEHFIL_PERMISSION_USER,
  MOBILE_MEHFIL_PERMISSIONS,
  MOBILE_REMOVE_MEHFIL_PERMISSION_USER,
} from './gql';
import { KarkunSearchPopup } from './karkun-search-popup';

type Group = NonNullable<
  NonNullable<NonNullable<MobileMehfilPermissionsQuery['workspaceMehfilPermissions']>['groups']>[number]
>;
type Permission = NonNullable<NonNullable<Group['permissions']>[number]>;
type PermissionUser = NonNullable<NonNullable<Permission['users']>[number]>;

// Changing permissions can change what the caller themselves can open, so the
// Workspaces tab's location lists are reloaded too.
const REFETCH = [
  'mobileMehfilPermissions',
  'mobileMyMehfilPermissionsLocations',
  'mobileMyMehfilDetailsLocations',
  'mobileMyDutiesAttendanceLocations',
];

const userLabel = (user: PermissionUser) =>
  user.displayName ? `${user.displayName} (${user.username ?? ''})` : (user.username ?? user.userId ?? '');

interface Adding {
  featureKey: string;
  permissionKey: string;
  name: string;
}

/**
 * Workspace → a mehfil → Mehfil Permissions: who holds which permission on
 * the mehfil, for each of its features. Those who can manage permissions add
 * and remove people; the others only look.
 */
export const MehfilPermissionsScreen = () => {
  const { locationId } = useParams<{ locationId: string }>();
  const online = useOnlineStatus();
  const { data, loading, error, refetch } = useQuery(MOBILE_MEHFIL_PERMISSIONS, {
    variables: { locationId },
    fetchPolicy: 'cache-and-network',
  });
  const [addUser] = useMutation(MOBILE_ADD_MEHFIL_PERMISSION_USER, { refetchQueries: REFETCH });
  const [removeUser] = useMutation(MOBILE_REMOVE_MEHFIL_PERMISSION_USER, { refetchQueries: REFETCH });
  const [adding, setAdding] = useState<Adding | null>(null);

  const workspace = data?.workspaceMehfilPermissions;
  const canManage = online && (workspace?.permissions ?? []).includes(MehfilPermissionsPermissions.MANAGE);
  const groups = (workspace?.groups ?? []).filter((group): group is Group => group?.featureKey != null);
  const refresh = () => refetch().then(() => undefined, () => undefined);

  // The people already holding the permission being added, as of the latest data.
  const holders = adding
    ? groups
        .find(group => group.featureKey === adding.featureKey)
        ?.permissions?.find(permission => permission?.key === adding.permissionKey)
        ?.users?.flatMap(user => (user?.personId ? [user.personId] : [])) ?? []
    : [];

  const addPerson = async (karkun: { _id: string; name: string }) => {
    if (!adding) return;
    try {
      await addUser({
        variables: {
          locationId,
          featureKey: adding.featureKey,
          permissionKey: adding.permissionKey,
          karkunId: karkun._id,
        },
      });
      showSuccess(`${karkun.name} added to "${adding.name}".`);
    } catch (failure) {
      showError(failure, `Could not add ${karkun.name}.`);
    }
  };

  const confirmRemove = async (permission: Permission, featureKey: string, user: PermissionUser) => {
    if (!permission.key || !user.userId) return;
    const ok = await Dialog.confirm({
      cancelText: 'Cancel',
      confirmText: 'Remove',
      content:
        permission.key === 'view' ? 'This also removes any other permissions that depend on it.' : undefined,
      title: `Remove ${userLabel(user)} from "${permission.name}"?`,
    });
    if (!ok) return;
    try {
      await removeUser({
        variables: { locationId, featureKey, permissionKey: permission.key, userId: user.userId },
      });
      showSuccess('Person removed.');
    } catch (failure) {
      showError(failure, 'Could not remove the person.');
    }
  };

  let content;
  if (loading && !data) {
    content = <PageLoading />;
  } else if (error && !data) {
    content = <PageError error={error} onRetry={refresh} />;
  } else if (groups.length === 0) {
    content = <PageEmpty title="No permissions available" />;
  } else {
    content = (
      <PullToRefresh onRefresh={refresh}>
        {groups.map(group => (
          <List key={group.featureKey} header={group.featureName ?? group.featureKey} mode="card">
            {(group.permissions ?? []).flatMap(permission =>
              permission?.key
                ? [
                    <List.Item
                      key={permission.key}
                      arrowIcon={false}
                      description={
                        <div className="mehfil-permission-users">
                          {permission.description ? (
                            <span className="mehfil-permission-description">{permission.description}</span>
                          ) : null}
                          <div className="mehfil-permission-tags">
                            {(permission.users ?? []).flatMap(user =>
                              user?.userId
                                ? [
                                    <Tag
                                      key={user.userId}
                                      fill="outline"
                                      onClick={
                                        canManage ? () => confirmRemove(permission, group.featureKey!, user) : undefined
                                      }
                                    >
                                      {userLabel(user)}
                                      {canManage ? ' ×' : ''}
                                    </Tag>,
                                  ]
                                : [],
                            )}
                            {(permission.users ?? []).length === 0 ? (
                              <span className="mehfil-permission-description">No one yet</span>
                            ) : null}
                          </div>
                        </div>
                      }
                      extra={
                        canManage ? (
                          <Button
                            aria-label={`Add person to ${permission.name}`}
                            fill="none"
                            size="small"
                            onClick={() =>
                              setAdding({
                                featureKey: group.featureKey!,
                                permissionKey: permission.key!,
                                name: permission.name ?? permission.key!,
                              })
                            }
                          >
                            <UserAddOutline />
                          </Button>
                        ) : undefined
                      }
                    >
                      {permission.name}
                    </List.Item>,
                  ]
                : [],
            )}
          </List>
        ))}
      </PullToRefresh>
    );
  }

  return (
    <Page backTo={WorkspacesPaths.root} title="Mehfil permissions">
      {content}
      <KarkunSearchPopup
        locationId={locationId}
        selectedIds={holders}
        selectedLabel="Added"
        title={adding ? `Add person · ${adding.name}` : 'Add person'}
        visible={adding != null}
        onClose={() => setAdding(null)}
        onPick={addPerson}
      />
    </Page>
  );
};
