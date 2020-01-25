import { Meteor } from 'meteor/meteor';
import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { useLoggedInUser } from 'meteor/idreesia-common/hooks/common';
import {
  setLoggedInUserId,
  setActiveModuleName,
  setActiveSubModuleName,
} from 'meteor/idreesia-common/action-creators';
import { getDownloadUrl } from 'meteor/idreesia-common/utilities';
import { Avatar, Dropdown, Menu, Modal, message } from './antd-controls';
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
  const changePasswordForm = useRef(null);
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

  const handleChagePassword = () => {
    changePasswordForm.current.validateFields(null, (err, values) => {
      if (!err) {
        const { oldPassword, newPassword } = values;

        Accounts.changePassword(oldPassword, newPassword, error => {
          setShowChangePasswordForm(false);

          if (!error) {
            Meteor.logoutOtherClients();
            message.success('Your password has been changed.', 5);
            history.push(location.pathname);
          } else {
            message.error(error.message, 5);
          }
        });
      }
    });
  };

  const handleChangePasswordCancelled = () => {
    setShowChangePasswordForm(false);
  };

  const userName = user.karkun ? user.karkun.name : user.displayName;

  let avatar = <Avatar size="large" icon="user" />;
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
      <Modal
        title="Change Password"
        visible={showChangePasswordForm}
        onOk={handleChagePassword}
        onCancel={handleChangePasswordCancelled}
      >
        <ChangePasswordForm ref={changePasswordForm} />
      </Modal>
    </>
  );
};

UserMenu.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default UserMenu;
