import React, { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { type History } from 'history';
import {
  AuditOutlined,
  BarcodeOutlined,
  BarsOutlined,
  BookOutlined,
  FlagOutlined,
  IdcardOutlined,
  LaptopOutlined,
  TagsOutlined,
  TeamOutlined,
  ToolOutlined,
  UnlockOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';

import { useActiveModule } from 'meteor/idreesia-common/hooks/common';
import { Menu } from 'antd';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

const IconStyle: CSSProperties = {
  fontSize: '20px',
};

const menuItems = [
  {
    key: 'mehfil-management',
    icon: <FlagOutlined style={IconStyle} />,
    label: 'Mehfil Management',
    children: [
      {
        key: 'mehfils',
        icon: <BarsOutlined style={IconStyle} />,
        label: 'Mehfils',
      },
      {
        key: 'mehfil-card-verification',
        icon: <BarcodeOutlined style={IconStyle} />,
        label: 'Scan Karkun Card',
      },
    ],
  },
  {
    key: 'visitors',
    icon: <TeamOutlined style={IconStyle} />,
    label: 'Visitors',
    children: [
      {
        key: 'visitor-registration',
        icon: <IdcardOutlined style={IconStyle} />,
        label: 'Registration',
      },
      {
        key: 'visitor-list',
        icon: <UnorderedListOutlined style={IconStyle} />,
        label: 'Visitor List',
      },
      {
        key: 'visitor-card-verification',
        icon: <BarcodeOutlined style={IconStyle} />,
        label: 'Card Verification',
      },
      {
        key: 'visitor-stay-report',
        icon: <BookOutlined style={IconStyle} />,
        label: 'Visitor Stay Report',
      },
    ],
  },
  {
    key: 'setup',
    icon: <LaptopOutlined style={IconStyle} />,
    label: 'Setup',
    children: [
      {
        key: 'mehfil-duties',
        icon: <TagsOutlined style={IconStyle} />,
        label: 'Mehfil Duties',
      },
      {
        key: 'mehfil-langar-dishes',
        icon: <TagsOutlined style={IconStyle} />,
        label: 'Langar Dishes',
      },
      {
        key: 'mehfil-langar-locations',
        icon: <TagsOutlined style={IconStyle} />,
        label: 'Langar Locations',
      },
    ],
  },
  {
    key: 'administration',
    icon: <ToolOutlined style={IconStyle} />,
    label: 'Administration',
    children: [
      {
        key: 'security-user-accounts',
        icon: <UnlockOutlined style={IconStyle} />,
        label: 'Security User Accounts',
      },
      {
        key: 'audit-logs',
        icon: <AuditOutlined style={IconStyle} />,
        label: 'Audit Logs',
      },
    ],
  },
];

interface SidebarProps {
  history: History;
}

interface MenuClickInfo {
  key: string;
}

interface MenuRouteMatch {
  key: string;
  openKey: string;
  subModuleName: string;
  matches: (pathname: string) => boolean;
}

const isPath = (pathname: string, basePath: string) =>
  pathname === basePath || pathname.startsWith(`${basePath}/`);

const menuRouteMatches: MenuRouteMatch[] = [
  {
    key: 'mehfils',
    openKey: 'mehfil-management',
    subModuleName: SubModuleNames.mehfils,
    matches: (pathname) => isPath(pathname, paths.mehfilsPath),
  },
  {
    key: 'mehfil-card-verification',
    openKey: 'mehfil-management',
    subModuleName: SubModuleNames.mehfilCardVerification,
    matches: (pathname) => isPath(pathname, paths.mehfilCardVerificationPath),
  },
  {
    key: 'visitor-list',
    openKey: 'visitors',
    subModuleName: SubModuleNames.visitorList,
    matches: (pathname) =>
      isPath(pathname, paths.visitorRegistrationListPath) ||
      pathname === paths.visitorRegistrationNewFormPath ||
      pathname === paths.visitorRegistrationUploadFormPath ||
      (pathname.startsWith(`${paths.visitorRegistrationPath}/`) &&
        !isPath(pathname, paths.visitorRegistrationListPath)),
  },
  {
    key: 'visitor-registration',
    openKey: 'visitors',
    subModuleName: SubModuleNames.visitorRegistration,
    matches: (pathname) => pathname === paths.visitorRegistrationPath,
  },
  {
    key: 'visitor-card-verification',
    openKey: 'visitors',
    subModuleName: SubModuleNames.visitorCardVerification,
    matches: (pathname) => isPath(pathname, paths.visitorCardVerificationPath),
  },
  {
    key: 'visitor-stay-report',
    openKey: 'visitors',
    subModuleName: SubModuleNames.visitorStayReport,
    matches: (pathname) => isPath(pathname, paths.visitorStayReportPath),
  },
  {
    key: 'mehfil-duties',
    openKey: 'setup',
    subModuleName: SubModuleNames.mehfilDuties,
    matches: (pathname) => isPath(pathname, paths.mehfilDutiesPath),
  },
  {
    key: 'mehfil-langar-dishes',
    openKey: 'setup',
    subModuleName: SubModuleNames.mehfilLangarDishes,
    matches: (pathname) => isPath(pathname, paths.mehfilLangarDishesPath),
  },
  {
    key: 'mehfil-langar-locations',
    openKey: 'setup',
    subModuleName: SubModuleNames.mehfilLangarLocations,
    matches: (pathname) => isPath(pathname, paths.mehfilLangarLocationsPath),
  },
  {
    key: 'security-user-accounts',
    openKey: 'administration',
    subModuleName: SubModuleNames.securityUsers,
    matches: (pathname) => isPath(pathname, paths.securityUsersPath),
  },
  {
    key: 'audit-logs',
    openKey: 'administration',
    subModuleName: SubModuleNames.auditLogs,
    matches: (pathname) => isPath(pathname, paths.auditLogsPath),
  },
];

const resolveMenuFromPath = (pathname: string): MenuRouteMatch | null =>
  menuRouteMatches.find((entry) => entry.matches(pathname)) ?? null;

const Sidebar = ({ history }: SidebarProps) => {
  const { setActiveSubModuleName } = useActiveModule();
  const [pathname, setPathname] = useState(history.location.pathname);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  useEffect(() => {
    const unlisten = history.listen((location) => {
      setPathname(location.pathname);
    });
    return unlisten;
  }, [history]);

  const activeMenu = useMemo(
    () => resolveMenuFromPath(pathname),
    [pathname]
  );

  useEffect(() => {
    if (!activeMenu) return;

    setActiveSubModuleName(activeMenu.subModuleName);
    setOpenKeys((prev) =>
      prev.includes(activeMenu.openKey)
        ? prev
        : [...prev, activeMenu.openKey]
    );
  }, [activeMenu, setActiveSubModuleName]);

  const handleMenuItemSelected = ({ key }: MenuClickInfo) => {
    switch (key) {
      case 'mehfils':
        history.push(paths.mehfilsPath);
        break;

      case 'mehfil-duties':
        history.push(paths.mehfilDutiesPath);
        break;

      case 'mehfil-langar-dishes':
        history.push(paths.mehfilLangarDishesPath);
        break;

      case 'mehfil-langar-locations':
        history.push(paths.mehfilLangarLocationsPath);
        break;

      case 'mehfil-card-verification':
        history.push(paths.mehfilCardVerificationPath);
        break;

      case 'visitor-registration':
        history.push(paths.visitorRegistrationPath);
        break;

      case 'visitor-list':
        history.push(paths.visitorRegistrationListPath);
        break;

      case 'visitor-card-verification':
        history.push(paths.visitorCardVerificationPath);
        break;

      case 'security-user-accounts':
        history.push(paths.securityUsersPath);
        break;

      case 'audit-logs':
        history.push(paths.auditLogsPath);
        break;

      case 'visitor-stay-report':
        history.push(paths.visitorStayReportPath);
        break;

      default:
        break;
    }
  };

  return (
    <Menu
      mode="inline"
      style={{ height: '100%', borderRight: 0 }}
      selectedKeys={activeMenu ? [activeMenu.key] : []}
      openKeys={openKeys}
      onOpenChange={(keys) => {
        setOpenKeys(keys as string[]);
      }}
      onClick={handleMenuItemSelected}
      items={menuItems}
    />
  );
};

export default Sidebar;
