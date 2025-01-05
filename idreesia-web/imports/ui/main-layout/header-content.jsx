import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Layout, Menu } from 'antd';
import { useDispatch } from 'react-redux';
import { useMutation } from '@apollo/react-hooks';

import {
  kebabCase,
  keys,
  forEach,
} from 'meteor/idreesia-common/utilities/lodash';
import { ModuleNames, ModulePaths } from 'meteor/idreesia-common/constants';
import { setActiveModuleName } from 'meteor/idreesia-common/action-creators';
import UserMenu from './user-menu';
import { UPDATE_LAST_ACTIVE_TIME } from './gql';

const ContainerStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
};

const modulePathsMapping = {
  [ModuleNames.admin]: ModulePaths.admin,
  // ***********************************************
  // Items within this section would be grouped under
  // the node '381-A Operations'
  [ModuleNames.accounts]: ModulePaths.accounts,
  [ModuleNames.hr]: ModulePaths.hr,
  [ModuleNames.inventory]: ModulePaths.inventory,
  [ModuleNames.operations]: ModulePaths.operations,
  [ModuleNames.outstation]: ModulePaths.outstation,
  [ModuleNames.security]: ModulePaths.security,
  // ***********************************************
  [ModuleNames.portals]: ModulePaths.portals,
};

const isModuleAccessible = (user, moduleName) => {
  // For a module to be accessible to the user, the user needs to have at least
  // one permission for that module.
  const { permissions } = user;
  const lcModuleName = kebabCase(moduleName);
  let isAccessible = false;
  forEach(permissions, permission => {
    if (permission.startsWith(lcModuleName)) {
      isAccessible = true;
    }
  });

  return isAccessible;
};

const HeaderContent = ({ history, location, user }) => {
  const dispatch = useDispatch();
  const [updateLastActiveTime] = useMutation(UPDATE_LAST_ACTIVE_TIME);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateLastActiveTime();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const { pathname } = location;
    if (pathname !== '/') {
      const moduleNames = keys(modulePathsMapping);
      forEach(moduleNames, moduleName => {
        const modulePath = modulePathsMapping[moduleName];
        if (pathname.startsWith(modulePath)) {
          dispatch(setActiveModuleName(moduleName));
        }
      });
    }
  }, [ user ]);

  const handleMenuItemSelected = ({ key }) => {
    const modulePath = modulePathsMapping[key];
    history.push(modulePath);
    dispatch(setActiveModuleName(key));
  };

  const menuItems = [];
  const childMenuItems = [];
  const selectedMenuItemKey = [];

  if (user) {
    const { pathname } = location;

    // Add the admin node if it is accessible to the user
    if (isModuleAccessible(user, ModuleNames.admin)) {
      if (isModuleAccessible(user, ModuleNames.admin)) {
        menuItems.push({ key: ModuleNames.admin, label: ModuleNames.admin });
        if (pathname.startsWith(ModulePaths.admin)) {
          selectedMenuItemKey.push(ModuleNames.admin);
        }
      }
    }

    // Add the 381-a operations node if any child of it are
    // accessible to the user 
    const moduleNames = keys(modulePathsMapping);
    moduleNames.forEach((moduleName) => {
      if([ModuleNames.admin, ModuleNames.portals].includes(moduleName) === false) {
        if (isModuleAccessible(user, moduleName)) {
          childMenuItems.push({ key: moduleName, label: moduleName });
          const modulePath = modulePathsMapping[moduleName];
          if (pathname.startsWith(modulePath)) {
            selectedMenuItemKey.push(moduleName);
          }
        }
      }
    });

    if (childMenuItems.length > 0) {
      menuItems.push({
        key: '381-a-group',
        label: '381-A Operations',
        children: childMenuItems,
      });
    }

    // Add the mehfil portal node if it is accessible to the user
    if (isModuleAccessible(user, ModuleNames.portals)) {
      if (isModuleAccessible(user, ModuleNames.portals)) {
        menuItems.push({ key: ModuleNames.portals, label: ModuleNames.portals });
        if (pathname.startsWith(ModulePaths.portals)) {
          selectedMenuItemKey.push(ModuleNames.portals);
        }
      }
    }
  }

  return (
    <Layout.Header>
      <div style={ContainerStyle}>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={selectedMenuItemKey}
          onSelect={handleMenuItemSelected}
          items={menuItems}
          style={{ width: "50%" }}
        />
        <UserMenu history={history} location={location} />
      </div>
    </Layout.Header>
  );
};

HeaderContent.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  user: PropTypes.object,
};

export default HeaderContent;
