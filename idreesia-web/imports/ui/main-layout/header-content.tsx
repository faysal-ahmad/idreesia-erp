import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Layout, Menu } from 'antd';
import { useDispatch } from 'react-redux';
import { useMutation } from '@apollo/client/react';

import {
  kebabCase,
  keys,
  forEach,
} from 'meteor/idreesia-common/utilities/lodash';
import { ModuleNames, ModulePaths } from 'meteor/idreesia-common/constants';
import { setActiveModuleName } from 'meteor/idreesia-common/action-creators';
import UserMenu from './user-menu';
import { UPDATE_LAST_ACTIVE_TIME } from './gql';

const AntLayout = Layout as any;
const AntMenu = Menu as any;
const UserMenuControl = UserMenu as any;
type AnyRecord = Record<string, any>;
interface HistoryLike { push(path: string): void; }
interface LocationLike { pathname: string; }
interface UserLike { permissions?: string[]; }
interface Props { history: HistoryLike; location: LocationLike; user?: UserLike | null; }
interface MenuSelectInfo { key: string; }

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
  [ModuleNames.hr]: ModulePaths.hr,
  [ModuleNames.inventory]: ModulePaths.inventory,
  [ModuleNames.security]: ModulePaths.security,
  // ***********************************************
};

const isModuleAccessible = (user: UserLike, moduleName: string) => {
  // For a module to be accessible to the user, the user needs to have at least
  // one permission for that module.
  const { permissions = [] } = user;
  const lcModuleName = kebabCase(moduleName);
  let isAccessible = false;
  forEach(permissions, (permission: string) => {
    if (permission.startsWith(lcModuleName)) {
      isAccessible = true;
    }
  });

  return isAccessible;
};

const HeaderContent = ({ history, location, user }: Props) => {
  const dispatch = useDispatch<any>();
  const [updateLastActiveTime] = useMutation(UPDATE_LAST_ACTIVE_TIME as any);

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
      forEach(moduleNames, (moduleName: string) => {
        const modulePath = modulePathsMapping[moduleName];
        if (pathname.startsWith(modulePath)) {
          dispatch(setActiveModuleName(moduleName));
        }
      });
    }
  }, [ user ]);

  const handleMenuItemSelected = ({ key }: MenuSelectInfo) => {
    const modulePath = modulePathsMapping[key];
    history.push(modulePath);
    dispatch(setActiveModuleName(key));
  };

  const menuItems: any[] = [];
  const childMenuItems: any[] = [];
  const selectedMenuItemKey: string[] = [];

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
    moduleNames.forEach((moduleName: string) => {
      if(moduleName !== ModuleNames.admin) {
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
  }

  return (
    <AntLayout.Header>
      <div style={ContainerStyle as any}>
        <AntMenu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={selectedMenuItemKey}
          onSelect={handleMenuItemSelected}
          items={menuItems}
          style={{ width: "50%" }}
        />
        <UserMenuControl history={history} location={location} />
      </div>
    </AntLayout.Header>
  );
};

HeaderContent.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  user: PropTypes.object,
};

export default HeaderContent;
