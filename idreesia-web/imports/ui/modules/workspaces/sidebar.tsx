import React, { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { type History } from 'history';
import { Menu } from 'antd';
import { ClusterOutlined, TeamOutlined } from '@ant-design/icons';

import { useActiveModule } from 'meteor/idreesia-common/hooks/common';
import { useMyCommittees } from './hooks/use-my-committees';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

const IconStyle: CSSProperties = {
  fontSize: '20px',
};

interface SidebarProps {
  history: History;
}

type PathBuilder = (committeeId?: string) => string;
type KeyPrefixHandler = [string, string, PathBuilder];

// [menu key prefix, sub-module name, path builder] for each committee
// sub-module. Menu keys are `${prefix}-${committeeId}`.
const KeyPrefixHandlers: KeyPrefixHandler[] = [
  ['members', SubModuleNames.members, paths.committeeMembersPath],
];

interface ActiveMenu {
  committeeId: string;
  key: string;
  subModuleName: string;
}

const COMMITTEE_PATH_REGEX = new RegExp(
  `^${paths.committeePath('([^/]+)')}/([^/]+)`
);

const resolveMenuFromPath = (pathname: string): ActiveMenu | null => {
  const match = COMMITTEE_PATH_REGEX.exec(pathname);
  if (!match) return null;
  const [, committeeId, prefix] = match;
  const handler = KeyPrefixHandlers.find(([p]) => p === prefix);
  if (!handler) return null;
  return {
    committeeId,
    key: `${prefix}-${committeeId}`,
    subModuleName: handler[1],
  };
};

const sameKeySet = (a: string[], b: string[]) => {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((key) => setB.has(key));
};

// Lists the committees the user is a member of, each with its sub-modules.
const Sidebar = ({ history }: SidebarProps) => {
  const { activeSubModuleName, setActiveSubModuleName } = useActiveModule();
  const { committees, loading } = useMyCommittees();
  const [pathname, setPathname] = useState(history.location.pathname);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    const unlisten = history.listen((location) => {
      setPathname(location.pathname);
    });
    return unlisten;
  }, [history]);

  const activeMenu = useMemo(() => resolveMenuFromPath(pathname), [pathname]);

  useEffect(() => {
    if (!activeMenu) return;

    if (activeSubModuleName !== activeMenu.subModuleName) {
      setActiveSubModuleName(activeMenu.subModuleName);
    }

    setOpenKeys((prev) => {
      const merged = Array.from(new Set([...prev, activeMenu.committeeId]));
      return sameKeySet(prev, merged) ? prev : merged;
    });
  }, [activeMenu, activeSubModuleName, setActiveSubModuleName]);

  const handleOpenChange = (keys: string[]) => {
    setOpenKeys((prev) => (sameKeySet(prev, keys) ? prev : keys));
  };

  const handleMenuItemSelected = ({ key }: { key: string }) => {
    const handler = KeyPrefixHandlers.find(([prefix]) =>
      key.startsWith(`${prefix}-`)
    );
    if (!handler) return;

    const [prefix, subModuleName, getPath] = handler;
    const committeeId = key.slice(prefix.length + 1);
    setActiveSubModuleName(subModuleName);
    history.push(getPath(committeeId));
  };

  if (loading) return null;

  const menuItems = committees.map((committee) => ({
    key: committee._id!,
    icon: <ClusterOutlined style={IconStyle} />,
    label: committee.name,
    children: [
      {
        key: `members-${committee._id}`,
        icon: <TeamOutlined style={IconStyle} />,
        label: 'Members',
      },
    ],
  }));

  return (
    <Menu
      mode="inline"
      style={{ height: '100%', borderRight: 0 }}
      selectedKeys={activeMenu ? [activeMenu.key] : []}
      openKeys={openKeys}
      onOpenChange={handleOpenChange}
      onClick={handleMenuItemSelected}
      items={menuItems}
    />
  );
};

export default Sidebar;
