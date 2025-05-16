import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Divider, Dropdown, Flex, Menu, Space, Typography } from 'antd';
import {
  AuditOutlined,
  BookOutlined,
  DownOutlined,
  FolderOpenOutlined,
  RedEnvelopeOutlined,
  SolutionOutlined,
  TeamOutlined,
  ToolOutlined,
  UnlockOutlined,
} from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithActiveModule } from 'meteor/idreesia-common/composers/common';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

const IconStyle = {
  fontSize: '20px',
};

class Sidebar extends Component {
  static propTypes = {
    history: PropTypes.object,
    collapsed: PropTypes.bool,
    activeModuleName: PropTypes.string,
    activeSubModuleName: PropTypes.string,
    setActiveSubModuleName: PropTypes.func,
    loading: PropTypes.bool,
    allAccessiblePortals: PropTypes.array,
  };

  state = {
    selectedPortal: null,
  };

  handleMenuItemSelected = ({ item, key }) => {
    const { history, setActiveSubModuleName } = this.props;
    const portalId = this.state.selectedPortal?._id;

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

  onPortalSelectionClicked = ({ key }) => {
    const { allAccessiblePortals } = this.props;
    const portal = allAccessiblePortals.find(portal => portal._id === key);
    this.setState({ selectedPortal: portal });
  }

  render() {
    const { collapsed, loading, allAccessiblePortals } = this.props;
    if (loading) return null;
    if (allAccessiblePortals?.length === 0) return null;

    if (!this.state.selectedPortal) {
      this.setState({ selectedPortal: allAccessiblePortals?.[0] });
    }

    const items = allAccessiblePortals.map(portal => ({
      key: portal._id,
      label: portal.name,
    }));

    const portalSelection = allAccessiblePortals?.length === 1 ? (
      <Typography.Title level={3} ellipsis>
        {collapsed ? '' : this.state.selectedPortal?.name}
      </Typography.Title>  
    ) : (
      <Flex justify='center' align='center'>
        <Dropdown
          trigger={['click']}
          menu={{
            items,
            selectable: true,
            onClick: this.onPortalSelectionClicked,
          }}
        >
          <Typography.Title level={3} ellipsis>
            {
              collapsed ? null : (
                <Space>
                  {this.state.selectedPortal?.name}
                  <DownOutlined />
                </Space>
              )
            }
          </Typography.Title>  
        </Dropdown>
      </Flex>  
    );

    return (
      <>
        {portalSelection}
        <Divider style={{ margin: 0 }} />
        <Menu
          mode="inline"
          style={{ height: '100%', borderRight: 0 }}
          onClick={this.handleMenuItemSelected}
        >
          <Menu.Item key="karkuns">
            <TeamOutlined style={IconStyle} />
            <span>Karkuns</span>
          </Menu.Item>
          <Menu.Item key="members">
            <TeamOutlined style={IconStyle} />
            <span>Members</span>
          </Menu.Item>
          <Menu.Item key="attendance-sheets">
            <SolutionOutlined style={IconStyle} />
            <span>Attendance Sheets</span>
          </Menu.Item>
          <Menu.Item key="amaanat-logs">
            <RedEnvelopeOutlined style={IconStyle} />
            <span>Amaanat Logs</span>
          </Menu.Item>
          <Menu.SubMenu
            key="reports"
            title={
              <>
                <FolderOpenOutlined style={IconStyle} />
                <span>Reports</span>
              </>
            }
          >
            <Menu.Item key="new-ehad-report">
              <BookOutlined style={IconStyle} />
              <span>New Ehad Report</span>
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.SubMenu
            key="administration"
            title={
              <>
                <ToolOutlined style={IconStyle} />
                <span>Administration</span>
              </>
            }
          >
            <Menu.Item key="audit-logs">
              <AuditOutlined style={IconStyle} />
              <span>Audit Logs</span>
            </Menu.Item>
            <Menu.Item key="user-accounts">
              <UnlockOutlined style={IconStyle} />
              <span>User Accounts</span>
            </Menu.Item>
          </Menu.SubMenu>
        </Menu>
      </>
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
