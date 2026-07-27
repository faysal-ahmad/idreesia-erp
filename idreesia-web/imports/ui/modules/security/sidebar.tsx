import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
} from '@ant-design/icons';

import { WithActiveModule } from 'meteor/idreesia-common/composers/common';
import { Menu } from 'antd';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

const AntMenu = Menu as any;
const AntAuditOutlined = AuditOutlined as any;
const AntBarcodeOutlined = BarcodeOutlined as any;
const AntBarsOutlined = BarsOutlined as any;
const AntBookOutlined = BookOutlined as any;
const AntFlagOutlined = FlagOutlined as any;
const AntIdcardOutlined = IdcardOutlined as any;
const AntLaptopOutlined = LaptopOutlined as any;
const AntTagsOutlined = TagsOutlined as any;
const AntTeamOutlined = TeamOutlined as any;
const AntToolOutlined = ToolOutlined as any;
const AntUnlockOutlined = UnlockOutlined as any;

const IconStyle = {
  fontSize: '20px',
};

const menuItems = [
  {
    key: 'mehfil-management',
    icon: <AntFlagOutlined style={IconStyle} />,
    label: 'Mehfil Management',
    children: [
      {
        key: 'mehfils',
        icon: <AntBarsOutlined style={IconStyle} />,
        label: 'Mehfils',
      },
      {
        key: 'mehfil-card-verification',
        icon: <AntBarcodeOutlined style={IconStyle} />,
        label: 'Scan Karkun Card',
      },
    ],
  },
  {
    key: 'karkuns',
    icon: <AntTeamOutlined style={IconStyle} />,
    label: 'Karkuns',
    children: [
      {
        key: 'karkun-card-verification',
        icon: <AntBarcodeOutlined style={IconStyle} />,
        label: 'Card Verification',
      },
    ],
  },
  {
    key: 'visitors',
    icon: <AntTeamOutlined style={IconStyle} />,
    label: 'Visitors',
    children: [
      {
        key: 'visitor-registration',
        icon: <AntIdcardOutlined style={IconStyle} />,
        label: 'Registration',
      },
      {
        key: 'visitor-card-verification',
        icon: <AntBarcodeOutlined style={IconStyle} />,
        label: 'Card Verification',
      },
      {
        key: 'visitor-stay-report',
        icon: <AntBookOutlined style={IconStyle} />,
        label: 'Visitor Stay Report',
      },
    ],
  },
  {
    key: 'setup',
    icon: <AntLaptopOutlined style={IconStyle} />,
    label: 'Setup',
    children: [
      {
        key: 'mehfil-duties',
        icon: <AntTagsOutlined style={IconStyle} />,
        label: 'Mehfil Duties',
      },
      {
        key: 'mehfil-langar-dishes',
        icon: <AntTagsOutlined style={IconStyle} />,
        label: 'Langar Dishes',
      },
      {
        key: 'mehfil-langar-locations',
        icon: <AntTagsOutlined style={IconStyle} />,
        label: 'Langar Locations',
      },
    ],
  },
  {
    key: 'administration',
    icon: <AntToolOutlined style={IconStyle} />,
    label: 'Administration',
    children: [
      {
        key: 'security-user-accounts',
        icon: <AntUnlockOutlined style={IconStyle} />,
        label: 'Security User Accounts',
      },
      {
        key: 'audit-logs',
        icon: <AntAuditOutlined style={IconStyle} />,
        label: 'Audit Logs',
      },
    ],
  },
];

interface HistoryLike {
  push(path: string): void;
}

interface SidebarProps {
  history: HistoryLike;
  activeModuleName?: string;
  activeSubModuleName?: string;
  setActiveSubModuleName(subModuleName: string): void;
}

interface MenuClickInfo {
  key: string;
}

class Sidebar extends Component<SidebarProps> {
  static propTypes = {
    history: PropTypes.object,
    activeModuleName: PropTypes.string,
    activeSubModuleName: PropTypes.string,
    setActiveSubModuleName: PropTypes.func,
  };

  handleMenuItemSelected = ({ key }: MenuClickInfo) => {
    const { history, setActiveSubModuleName } = this.props;
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

      case 'karkun-card-verification':
        setActiveSubModuleName(SubModuleNames.karkunCardVerification);
        history.push(paths.karkunCardVerificationPath);
        break;

      case 'visitor-registration':
        setActiveSubModuleName(SubModuleNames.visitorRegistration);
        history.push(paths.visitorRegistrationPath);
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

      case 'team-visit-report':
        setActiveSubModuleName((SubModuleNames as any).teamVisitReport);
        history.push((paths as any).teamVisitReportPath);
        break;

      default:
        break;
    }
  };

  render() {
    return (
      <AntMenu
        mode="inline"
        style={{ height: '100%', borderRight: 0 }}
        onClick={this.handleMenuItemSelected}
        items={menuItems}
      />
    );
  }
}

const SidebarContainer = WithActiveModule()(Sidebar as any) as any;
export default SidebarContainer;
