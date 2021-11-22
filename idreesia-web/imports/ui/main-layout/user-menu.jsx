import { Meteor } from 'meteor/meteor';
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Dropdown, Menu } from 'antd';
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

  const menu = (
    <Menu
      style={{ height: '100%', borderRight: 0 }}
      onClick={handleMenuItemClicked}
    >
      <Menu.Item key="change-password">Change Password</Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout">Logout</Menu.Item>
    </Menu>
  );

  return (
    <>
      <Dropdown overlay={menu} placement="bottomLeft">
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
