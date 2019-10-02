import React from 'react';
import PropTypes from 'prop-types';

import { Button, WingBlank } from '/imports/ui/controls';

const ContainerStyle = {
  width: '300px',
  paddingTop: '10px',
  paddingBottom: '10px',
};

const UserProfile = ({ loggedInUser }) => {
  if (!loggedInUser) {
    return (
      <div style={ContainerStyle}>
        <WingBlank>
          <Button type="primary">Login</Button>
        </WingBlank>
      </div>
    );
  }

  return <div />;
};

UserProfile.propTypes = {
  loggedInUser: PropTypes.object,
};

export default UserProfile;
