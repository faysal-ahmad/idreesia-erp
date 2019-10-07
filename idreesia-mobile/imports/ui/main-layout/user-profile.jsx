import React from 'react';
import PropTypes from 'prop-types';

import { Button, WingBlank } from '/imports/ui/controls';

const ContainerStyle = {
  width: '300px',
  paddingTop: '10px',
  paddingBottom: '10px',
};

const UserProfile = ({ history, loggedInUser }) => {
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

  return <div />;
};

UserProfile.propTypes = {
  history: PropTypes.object,
  loggedInUser: PropTypes.object,
};

export default UserProfile;
