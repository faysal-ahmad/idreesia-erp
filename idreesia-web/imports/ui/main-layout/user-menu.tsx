// @ts-nocheck
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

const UserMenu = ({ history }) => {
  const dispatch = useDispatch();
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);
  const { user, userLoading } = useLoggedInUser();

  if (userLoading) return null;

  const handleMenuItemClicked = ({ key }) => {
    switch (key) {
      case 'logout':
        Meteor.logoutOtherClients();
        Meteor.logout(error => {
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

  let avatar = <Avatar size="large" icon={<UserOutlined />} />;
  if (user.karkun && user.karkun.imageId) {
    const url = getDownloadUrl(user.karkun.imageId);
    avatar = <Avatar size="large" src={url} />;
  }

  const menuItems = [
    { key: 'change-password', label: 'Change Password' },
    { type: 'divider' },
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

UserMenu.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default UserMenu;
