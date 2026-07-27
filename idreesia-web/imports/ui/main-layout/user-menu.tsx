import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Dropdown } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';

import { useLoggedInUser } from 'meteor/idreesia-common/hooks/common';
import {
  setLoggedInUserId,
  setActiveModuleName,
  setActiveSubModuleName,
} from 'meteor/idreesia-common/action-creators';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import ChangePasswordForm from './change-password-form';

const ContainerStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const AntAvatar = Avatar as any;
const AntDropdown = Dropdown as any;
const AntUserOutlined = UserOutlined as any;
const ChangePassword = ChangePasswordForm as any;
interface HistoryLike { push(path: string): void; }
interface Props { history: HistoryLike; }

const UserMenu = ({ history }: Props) => {
  const dispatch = useDispatch<any>();
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

  const userName = user.karkun ? user.karkun.name : user.displayName;

  let avatar = <AntAvatar size="large" icon={<AntUserOutlined />} />;
  if (user.karkun && user.karkun.imageId) {
    const url = getDownloadUrl(user.karkun.imageId);
    avatar = <AntAvatar size="large" src={url} />;
  }

  const menuItems = [
    { key: 'change-password', label: 'Change Password' },
    { type: 'divider' },
    { key: 'logout', label: 'Logout' },
  ];

  return (
    <>
      <AntDropdown
        menu={{ items: menuItems, onClick: handleMenuItemClicked }}
        placement="bottomLeft"
      >
        <div style={ContainerStyle as any}>
          <div style={{ color: '#FFFFFF' }}>{userName}</div>
          &nbsp; &nbsp;
          {avatar}
        </div>
      </AntDropdown>
      <ChangePassword 
        showForm={showChangePasswordForm}
        handlePasswordChanged={handleChangePasswordSuccess}
        handlePasswordChangeCancelled={handleChangePasswordCancelled}
      />
    </>
  );
};

UserMenu.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default UserMenu;
