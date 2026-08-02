import React, { type CSSProperties } from 'react';
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

const Sidebar = ({ history }: SidebarProps) => {
  const { setActiveSubModuleName } = useActiveModule();

  const handleMenuItemSelected = ({ key }: MenuClickInfo) => {
    switch (key) {
      case 'mehfils':
        setActiveSubModuleName(SubModuleNames.mehfils);
        history.push(paths.mehfilsPath);
        break;

      case 'mehfil-duties':
        setActiveSubModuleName(SubModuleNames.mehfilDuties);
        history.push(paths.mehfilDutiesPath);
        break;

      case 'mehfil-langar-dishes':
        setActiveSubModuleName(SubModuleNames.mehfilLangarDishes);
        history.push(paths.mehfilLangarDishesPath);
        break;

      case 'mehfil-langar-locations':
        setActiveSubModuleName(SubModuleNames.mehfilLangarLocations);
        history.push(paths.mehfilLangarLocationsPath);
        break;

      case 'mehfil-card-verification':
        setActiveSubModuleName(SubModuleNames.mehfilCardVerification);
        history.push(paths.mehfilCardVerificationPath);
        break;

      case 'visitor-registration':
        setActiveSubModuleName(SubModuleNames.visitorRegistration);
        history.push(paths.visitorRegistrationPath);
        break;

      case 'visitor-list':
        setActiveSubModuleName(SubModuleNames.visitorList);
        history.push(paths.visitorRegistrationListPath);
        break;

      case 'visitor-card-verification':
        setActiveSubModuleName(SubModuleNames.visitorCardVerification);
        history.push(paths.visitorCardVerificationPath);
        break;

      case 'security-user-accounts':
        setActiveSubModuleName(SubModuleNames.securityUsers);
        history.push(paths.securityUsersPath);
        break;

      case 'audit-logs':
        setActiveSubModuleName(SubModuleNames.auditLogs);
        history.push(paths.auditLogsPath);
        break;

      case 'visitor-stay-report':
        setActiveSubModuleName(SubModuleNames.visitorStayReport);
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
      onClick={handleMenuItemSelected}
      items={menuItems}
    />
  );
};

export default Sidebar;
