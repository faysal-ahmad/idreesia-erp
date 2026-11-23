import React, { useEffect, useMemo, useState } from 'react';
import { type History } from 'history';
import { useActiveModule } from 'meteor/idreesia-common/hooks/common';
import { Menu } from 'antd';

import usePurchasingAccess from './common/use-purchasing-access';
import menuEntries, { menuGroups } from './menu-entries';

interface SidebarProps {
  history: History;
}

interface MenuClickInfo {
  key: string;
}

const isPath = (pathname: string, basePath: string) =>
  pathname === basePath || pathname.startsWith(`${basePath}/`);

const Sidebar = ({ history }: SidebarProps) => {
  const { activeSubModuleName, setActiveSubModuleName } = useActiveModule();
  const { can } = usePurchasingAccess();
  const [pathname, setPathname] = useState(history.location.pathname);

  useEffect(() => {
    const unlisten = history.listen((location) => {
      setPathname(location.pathname);
    });
    return unlisten;
  }, [history]);

  const activeEntry = useMemo(
    () => menuEntries.find((entry) => isPath(pathname, entry.basePath)) ?? null,
    [pathname]
  );

  useEffect(() => {
    if (!activeEntry) return;
    if (activeSubModuleName !== activeEntry.subModuleName) {
      setActiveSubModuleName(activeEntry.subModuleName);
    }
  }, [activeEntry, activeSubModuleName, setActiveSubModuleName]);

  const toItem = ({ key, label, icon }: (typeof menuEntries)[number]) => ({ key, label, icon });
  const visible = menuEntries.filter((entry) => can(...entry.permissions));
  const items = [
    ...visible.filter((entry) => !entry.group).map(toItem),
    ...menuGroups.flatMap((group) => {
      const children = visible.filter((entry) => entry.group === group.key).map(toItem);
      return children.length
        ? [{ key: group.key, label: group.label, icon: group.icon, children }]
        : [];
    }),
  ];

  // Keep the group holding the current page open; the user can still toggle it.
  const [openKeys, setOpenKeys] = useState<string[]>([]);
  const activeGroup = activeEntry?.group;
  useEffect(() => {
    if (activeGroup) setOpenKeys((keys) => (keys.includes(activeGroup) ? keys : [...keys, activeGroup]));
  }, [activeGroup]);

  const handleMenuItemSelected = ({ key }: MenuClickInfo) => {
    const target = menuEntries.find((entry) => entry.key === key);
    if (target) history.push(target.basePath);
  };

  return (
    <Menu
      mode="inline"
      style={{ height: '100%', borderRight: 0 }}
      selectedKeys={activeEntry ? [activeEntry.key] : []}
      openKeys={openKeys}
      onOpenChange={setOpenKeys}
      onClick={handleMenuItemSelected}
      items={items}
    />
  );
};

export default Sidebar;
