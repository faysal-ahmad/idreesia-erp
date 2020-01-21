import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import {
  setLoggedInUser,
  setActiveModuleAndSubModuleName,
} from 'meteor/idreesia-common/action-creators';
import { Button, WingBlank } from '/imports/ui/controls';

const ContainerStyle = {
  width: '300px',
  paddingTop: '10px',
  paddingBottom: '10px',
};

const UserProfile = ({ history, loggedInUser }) => {
  const dispatch = useDispatch();

  if (!loggedInUser) {
    return (
      <div style={ContainerStyle}>
        <WingBlank>
          <Button
            type="primary"
            onClick={() => {
              history.push('/login');
            }}
          >
            Login
          </Button>
        </WingBlank>
      </div>
    );
  }

  return (
    <div style={ContainerStyle}>
      <WingBlank>
        <Button
          type="primary"
          onClick={() => {
            Meteor.logoutOtherClients();
            Meteor.logout(error => {
              if (error) {
                // eslint-disable-next-line no-console
                console.log(error);
              }
              dispatch(setLoggedInUser(null));
              dispatch(setActiveModuleAndSubModuleName(null, null));
              history.push('/');
            });
          }}
        >
          Logout
        </Button>
      </WingBlank>
    </div>
  );
};

UserProfile.propTypes = {
  history: PropTypes.object,
  loggedInUser: PropTypes.object,
};

export default UserProfile;
