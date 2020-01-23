import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIdCard } from '@fortawesome/free-solid-svg-icons/faIdCard';

import { setActiveModuleAndSubModuleName } from 'meteor/idreesia-common/action-creators';
import { ModuleNames } from 'meteor/idreesia-common/constants';
import {
  SecuritySubModuleNames,
  SecuritySubModulePaths,
} from '/imports/ui/modules/security';
import { List } from '/imports/ui/controls';

import UserProfile from './user-profile';

const IconStyle = {
  fontSize: 20,
};

const DrawerContent = ({ history, toggleDrawer }) => {
  const dispatch = useDispatch();
  const loggedInUser = useSelector(state => state.loggedInUser);
  const userProfile = (
    <UserProfile history={history} loggedInUser={loggedInUser} />
  );

  return (
    <>
      {userProfile}
      {loggedInUser ? (
        <List renderHeader="Security">
          <List.Item
            onClick={() => {
              toggleDrawer();
              dispatch(
                setActiveModuleAndSubModuleName(
                  ModuleNames.security,
                  SecuritySubModuleNames.visitorRegistration
                )
              );
              history.push(
                SecuritySubModulePaths.visitorRegistrationSearchPath
              );
            }}
            thumb={<FontAwesomeIcon icon={faIdCard} style={IconStyle} />}
          >
            Visitor Registration
          </List.Item>
        </List>
      ) : null}
    </>
  );
};

DrawerContent.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  toggleDrawer: PropTypes.func,
};

export default DrawerContent;
