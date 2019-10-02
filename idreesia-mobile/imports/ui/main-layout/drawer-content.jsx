import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClipboardList,
  faIdCard,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';

import { setActiveModuleAndSubModuleName } from 'meteor/idreesia-common/action-creators';
import { ModuleNames } from 'meteor/idreesia-common/constants';
import { HRSubModuleNames, HRSubModulePaths } from '/imports/ui/modules/hr';
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
  const userProfile = <UserProfile loggedInUser={loggedInUser} />;

  return (
    <>
      {userProfile}
      <List renderHeader="HR">
        <List.Item
          onClick={() => {
            toggleDrawer();
            dispatch(
              setActiveModuleAndSubModuleName(
                ModuleNames.hr,
                HRSubModuleNames.attendanceSheets
              )
            );
            history.push(HRSubModulePaths.attendanceSheetsPath);
          }}
          thumb={<FontAwesomeIcon icon={faClipboardList} style={IconStyle} />}
        >
          Attendance Sheets
        </List.Item>
        <List.Item
          onClick={() => {
            toggleDrawer();
            dispatch(
              setActiveModuleAndSubModuleName(
                ModuleNames.hr,
                HRSubModuleNames.teamManagement
              )
            );
            history.push(HRSubModulePaths.teamManagementPath);
          }}
          thumb={<FontAwesomeIcon icon={faUsers} style={IconStyle} />}
        >
          Team Management
        </List.Item>
      </List>
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
            history.push(SecuritySubModulePaths.visitorRegistrationNewFormPath);
          }}
          thumb={<FontAwesomeIcon icon={faIdCard} style={IconStyle} />}
        >
          Visitor Registration
        </List.Item>
      </List>
    </>
  );
};

DrawerContent.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  toggleDrawer: PropTypes.func,
};

export default DrawerContent;
