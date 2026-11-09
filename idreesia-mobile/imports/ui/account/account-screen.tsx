import React from 'react';
import { Dialog, List, SpinLoading } from 'antd-mobile';
import { DownlandOutline, LockOutline } from 'antd-mobile-icons';
import { logout } from '../auth/accounts';
import { useCurrentUser } from '../hooks';
import { Page, showError } from '../layout';
import { isOfflineStorageAvailable } from '../offline';
import { useHistory } from '../router';
import { AccountPaths } from './paths';

/** Account tab: profile, password and sign out. */
export const AccountScreen = () => {
  const history = useHistory();
  const { user, userLoading } = useCurrentUser();

  const name =
    user?.karkun?.sharedData?.name ?? user?.displayName ?? user?.username ?? '';
  const secondary = user?.username ?? user?.email ?? '';

  const handleLogout = async () => {
    const confirmed = await Dialog.confirm({
      content: 'Sign out of Idreesia on this device?',
      confirmText: 'Sign out',
      cancelText: 'Cancel',
    });
    if (!confirmed) return;

    try {
      await logout();
    } catch (error) {
      showError(error, 'Could not sign out.');
    }
  };

  return (
    <Page title="Account">
        <section className="profile-card">
          {userLoading && !user ? (
            <SpinLoading color="primary" />
          ) : (
            <>
              <div className="profile-avatar">
                {name.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="profile-text">
                <p className="profile-name">{name}</p>
                {secondary && secondary !== name && (
                  <p className="profile-secondary">{secondary}</p>
                )}
              </div>
            </>
          )}
        </section>

        <List mode="card">
          <List.Item
            prefix={<LockOutline />}
            onClick={() => history.push(AccountPaths.changePassword)}
          >
            Change password
          </List.Item>
          {isOfflineStorageAvailable() && (
            <List.Item
              prefix={<DownlandOutline />}
              onClick={() => history.push(AccountPaths.offlineFiles)}
            >
              Offline files
            </List.Item>
          )}
        </List>

        <List mode="card">
          <List.Item
            arrowIcon={false}
            className="logout-item"
            onClick={handleLogout}
          >
            Sign out
          </List.Item>
        </List>
    </Page>
  );
};
