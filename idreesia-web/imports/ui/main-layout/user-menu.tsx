import { Meteor } from 'meteor/meteor';
import React, { type CSSProperties, useState } from 'react';
import { Avatar, Dropdown } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { type History, type Location } from 'history';
import { useDispatch } from 'react-redux';

import { useLoggedInUser } from 'meteor/idreesia-common/hooks/common';
import {
  setLoggedInUserId,
  setActiveModuleName,
  setActiveSubModuleName,
} from 'meteor/idreesia-common/action-creators';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import ChangePasswordForm from './change-password-form';

const ContainerStyle: CSSProperties = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
};

interface Props {
  history: History;
  location?: Location;
}

const UserMenu = ({ history }: Props) => {
  const dispatch = useDispatch();
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const { user, userLoading } = useLoggedInUser();

  if (userLoading || !user) return null;

  const handleMenuItemClicked = ({ key }: { key: string }) => {
    switch (key) {
      case 'logout':
        (Meteor as any).logoutOtherClients();
        (Meteor as any).logout((error?: Error) => {
          if (error) {
            // eslint-disable-next-line no-console
            console.log(error);
          }
          history.push('/');
          dispatch(setLoggedInUserId(null));
          dispatch(setActiveModuleName(null));
          dispatch(setActiveSubModuleName(null));
        });
        break;

      case 'change-password':
        setShowChangePasswordForm(true);
        break;

      default:
        break;
    }
  };

  const handleChangePasswordSuccess = () => {
    setShowChangePasswordForm(false);
  };

  const handleChangePasswordCancelled = () => {
    setShowChangePasswordForm(false);
  };

  const userName = user.karkun?.sharedData?.name ?? user.displayName;

  let avatar = <Avatar size="large" icon={<UserOutlined />} />;
  if (user.karkun?.sharedData?.imageId) {
    const url = getDownloadUrl(user.karkun.sharedData.imageId);
    avatar = <Avatar size="large" src={url} />;
  }

  const menuItems = [
    { key: 'change-password', label: 'Change Password' },
    { type: 'divider' as const },
    { key: 'logout', label: 'Logout' },
  ];

  return (
    <>
      <Dropdown
        menu={{ items: menuItems, onClick: handleMenuItemClicked }}
        placement="bottomLeft"
      >
        <div style={ContainerStyle}>
          <div style={{ color: '#FFFFFF' }}>{userName}</div>
          &nbsp; &nbsp;
          {avatar}
        </div>
      </Dropdown>
      <ChangePasswordForm
        showForm={showChangePasswordForm}
        handlePasswordChanged={handleChangePasswordSuccess}
        handlePasswordChangeCancelled={handleChangePasswordCancelled}
      />
    </>
  );
};

export default UserMenu;
