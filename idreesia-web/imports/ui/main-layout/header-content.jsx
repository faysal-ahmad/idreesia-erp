import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation } from '@apollo/react-hooks';

import {
  kebabCase,
  keys,
  forEach,
} from 'meteor/idreesia-common/utilities/lodash';
import { ModuleNames, ModulePaths } from 'meteor/idreesia-common/constants';
import { setActiveModuleName } from 'meteor/idreesia-common/action-creators';
import { Layout, Menu } from './antd-controls';
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
  [ModuleNames.accounts]: ModulePaths.accounts,
  [ModuleNames.hr]: ModulePaths.hr,
  [ModuleNames.communication]: ModulePaths.communication,
  [ModuleNames.inventory]: ModulePaths.inventory,
  //  [ModuleNames.wazaifManagement]: ModulePaths.wazaifManagement,
  [ModuleNames.telephoneRoom]: ModulePaths.telephoneRoom,
  [ModuleNames.security]: ModulePaths.security,
  [ModuleNames.outstation]: ModulePaths.outstation,
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
  });

  const handleMenuItemSelected = ({ item /* , key, selectedKeys */ }) => {
    const moduleName = item.props.children;
    const modulePath = modulePathsMapping[moduleName];
    history.push(modulePath);
    dispatch(setActiveModuleName(moduleName));
  };

  const menuItems = [];
  const selectedMenuItemKey = [];

  if (user) {
    const { pathname } = location;
    const moduleNames = keys(modulePathsMapping);
    moduleNames.forEach((moduleName, index) => {
      const isAccessible = isModuleAccessible(user, moduleName);
      if (isAccessible) {
        const modulePath = modulePathsMapping[moduleName];
        menuItems.push(
          <Menu.Item key={index.toString()}>{moduleName}</Menu.Item>
        );
        if (pathname.startsWith(modulePath)) {
          selectedMenuItemKey.push(index.toString());
        }
      }
    });
  }

  return (
    <Layout.Header>
      <div style={ContainerStyle}>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={selectedMenuItemKey}
          style={{ lineHeight: '64px' }}
          onSelect={handleMenuItemSelected}
        >
          {menuItems}
        </Menu>
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
