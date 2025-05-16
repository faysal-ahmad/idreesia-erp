import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import {
  AuditOutlined,
  BookOutlined,
  FolderOpenOutlined,
  RedEnvelopeOutlined,
  ShopOutlined,
  SolutionOutlined,
  TeamOutlined,
  ToolOutlined,
  UnlockOutlined,
} from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithActiveModule } from 'meteor/idreesia-common/composers/common';
import { Menu } from 'antd';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

const IconStyle = {
  fontSize: '20px',
};

class Sidebar extends Component {
  static propTypes = {
    history: PropTypes.object,
    activeModuleName: PropTypes.string,
    activeSubModuleName: PropTypes.string,
    setActiveSubModuleName: PropTypes.func,
    loading: PropTypes.bool,
    allAccessiblePortals: PropTypes.array,
  };

  handleMenuItemSelected = ({ item, key }) => {
    const { history, setActiveSubModuleName } = this.props;
    const portalId = item.props['parent-key'];

    if (key.startsWith('karkuns')) {
      setActiveSubModuleName(SubModuleNames.karkuns);
      history.push(paths.karkunsPath(portalId));
    } else if (key.startsWith('members')) {
      setActiveSubModuleName(SubModuleNames.members);
      history.push(paths.membersPath(portalId));
    } else if (key.startsWith('attendance-sheets')) {
      setActiveSubModuleName(SubModuleNames.attendanceSheets);
      history.push(paths.attendanceSheetsPath(portalId));
    } else if (key.startsWith('amaanat-logs')) {
      setActiveSubModuleName(SubModuleNames.amaanatLogs);
      history.push(paths.amaanatLogsPath(portalId));
    } else if (key.startsWith('user-accounts')) {
      setActiveSubModuleName(SubModuleNames.users);
      history.push(paths.usersPath(portalId));
    } else if (key.startsWith('audit-logs')) {
      setActiveSubModuleName(SubModuleNames.auditLogs);
      history.push(paths.auditLogsPath(portalId));
    } else if (key.startsWith('new-ehad-report')) {
      setActiveSubModuleName(SubModuleNames.newEhadReport);
      history.push(paths.newEhadReportPath(portalId));
    }
  };

  getMenuItemsForPortal = portalId => [
    <Menu.Item parent-key={portalId} key={`karkuns-${portalId}`}>
      <TeamOutlined style={IconStyle} />
      <span>Karkuns</span>
    </Menu.Item>,
    <Menu.Item parent-key={portalId} key={`members-${portalId}`}>
      <TeamOutlined style={IconStyle} />
      <span>Members</span>
    </Menu.Item>,
    <Menu.Item parent-key={portalId} key={`attendance-sheets-${portalId}`}>
      <SolutionOutlined style={IconStyle} />
      <span>Attendance Sheets</span>
    </Menu.Item>,
    <Menu.Item parent-key={portalId} key={`amaanat-logs-${portalId}`}>
      <RedEnvelopeOutlined style={IconStyle} />
      <span>Amaanat Logs</span>
    </Menu.Item>,
    <Menu.SubMenu
      key={`reports-${portalId}`}
      title={
        <>
          <FolderOpenOutlined style={IconStyle} />
          <span>Reports</span>
        </>
      }
    >
      <Menu.Item parent-key={portalId} key={`new-ehad-report-${portalId}`}>
        <BookOutlined style={IconStyle} />
        <span>New Ehad Report</span>
      </Menu.Item>
    </Menu.SubMenu>,
    <Menu.SubMenu
      key={`administration-${portalId}`}
      title={
        <>
          <ToolOutlined style={IconStyle} />
          <span>Administration</span>
        </>
      }
    >
      <Menu.Item parent-key={portalId} key={`audit-logs-${portalId}`}>
        <AuditOutlined style={IconStyle} />
        <span>Audit Logs</span>
      </Menu.Item>
      <Menu.Item parent-key={portalId} key={`user-accounts-${portalId}`}>
        <UnlockOutlined style={IconStyle} />
        <span>User Accounts</span>
      </Menu.Item>
    </Menu.SubMenu>,
  ];

  render() {
    const { loading, allAccessiblePortals } = this.props;
    if (loading) return null;

    let subMenus = [];
    if (allAccessiblePortals.length === 1) {
      subMenus = this.getMenuItemsForPortal(allAccessiblePortals[0]._id);
    } else {
      allAccessiblePortals.forEach(portal => {
        subMenus.push(
          <Menu.SubMenu
            key={portal._id}
            title={
              <>
                <ShopOutlined style={IconStyle} />
                <span>{portal.name}</span>
              </>
            }
          >
            {this.getMenuItemsForPortal(portal._id)}
          </Menu.SubMenu>
        );
      });
    }

    return (
      <Menu
        mode="inline"
        style={{ height: '100%', borderRight: 0 }}
        onClick={this.handleMenuItemSelected}
      >
        {subMenus}
      </Menu>
    );
  }
}

const listQuery = gql`
  query allAccessiblePortals {
    allAccessiblePortals {
      _id
      name
    }
  }
`;

const SidebarContainer = flowRight(
  WithActiveModule(),
  graphql(listQuery, {
    props: ({ data }) => ({ ...data }),
  })
)(Sidebar);
export default SidebarContainer;
