import React, { type CSSProperties, useEffect } from 'react';
import { ConfigProvider, Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { type History, type Location } from 'history';
import { useDispatch } from 'react-redux';
import { useMutation } from '@apollo/client/react';

import {
  kebabCase,
  keys,
  forEach,
} from 'meteor/idreesia-common/utilities/lodash';
import { ModuleNames, ModulePaths } from 'meteor/idreesia-common/constants';
import { setActiveModuleName } from 'meteor/idreesia-common/action-creators';
import type { CommonCurrentUserQuery } from 'meteor/idreesia-common/types/client-operations';
import UserMenu from './user-menu';
import { UPDATE_LAST_ACTIVE_TIME } from './gql';

type User = NonNullable<CommonCurrentUserQuery['currentUser']>;

interface Props {
  history: History;
  location: Location;
  user?: User | null;
}

interface MenuSelectInfo {
  key: string;
}

const ContainerStyle: CSSProperties = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%',
};

const HEADER_BG = '#0f1a12';

const HeaderStyle: CSSProperties = {
  paddingLeft: 16,
  paddingRight: 16,
  background: HEADER_BG,
};

const HeaderTheme = {
  components: {
    Menu: {
      fontSize: 16,
      darkItemBg: HEADER_BG,
      darkSubMenuItemBg: '#16261a',
      darkItemSelectedBg: '#2a4d29',
      darkItemHoverBg: '#1f3a20',
      darkPopupBg: '#16261a',
    },
  },
};

const LogoStyle: CSSProperties = {
  height: 44,
  marginRight: 24,
  flexShrink: 0,
};

const modulePathsMapping: Record<string, string> = {
  [ModuleNames.admin]: ModulePaths.admin,
  // ***********************************************
  // Items within this section would be grouped under
  // the node '381-A Operations'
  [ModuleNames.hr]: ModulePaths.hr,
  [ModuleNames.stores]: ModulePaths.stores,
  [ModuleNames.security]: ModulePaths.security,
  // ***********************************************
};

const isModuleAccessible = (user: User, moduleName: string) => {
  // For a module to be accessible to the user, the user needs to have at least
  // one permission for that module.
  const { permissions = [] } = user;
  const lcModuleName = kebabCase(moduleName);
  let isAccessible = false;
  forEach(permissions, (permission) => {
    if (permission?.startsWith(lcModuleName)) {
      isAccessible = true;
    }
  });

  return isAccessible;
};

const HeaderContent = ({ history, location, user }: Props) => {
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
      forEach(moduleNames, (moduleName: string) => {
        const modulePath = modulePathsMapping[moduleName];
        if (pathname.startsWith(modulePath)) {
          dispatch(setActiveModuleName(moduleName));
        }
      });
    }
  }, [user]);

  const handleMenuItemSelected = ({ key }: MenuSelectInfo) => {
    const modulePath = modulePathsMapping[key];
    history.push(modulePath);
    dispatch(setActiveModuleName(key));
  };

  const menuItems: MenuProps['items'] = [];
  const childMenuItems: MenuProps['items'] = [];
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
      if (moduleName !== ModuleNames.admin) {
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
    <ConfigProvider theme={HeaderTheme}>
      <Layout.Header style={HeaderStyle}>
        <div style={ContainerStyle}>
          <img
            src="/images/eb-logo-emblem.png"
            alt="Eastern Breeze"
            style={LogoStyle}
          />
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={selectedMenuItemKey}
            onSelect={handleMenuItemSelected}
            items={menuItems}
            style={{ flex: 1 }}
          />
          <UserMenu history={history} location={location} />
        </div>
      </Layout.Header>
    </ConfigProvider>
  );
};

export default HeaderContent;
