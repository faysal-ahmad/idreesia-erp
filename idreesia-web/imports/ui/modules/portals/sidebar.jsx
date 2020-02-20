import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithActiveModule } from 'meteor/idreesia-common/composers/common';
import { Menu, Icon } from '/imports/ui/controls';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

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
    } else if (key.startsWith('visitors')) {
      setActiveSubModuleName(SubModuleNames.visitors);
      history.push(paths.visitorsPath(portalId));
    } else if (key.startsWith('attendance-sheets')) {
      setActiveSubModuleName(SubModuleNames.attendanceSheets);
      history.push(paths.attendanceSheetsPath(portalId));
    } else if (key.startsWith('amaanat-logs')) {
      setActiveSubModuleName(SubModuleNames.amaanatLogs);
      history.push(paths.amaanatLogsPath(portalId));
    }
  };

  getMenuItemsForPortal = portalId => [
    <Menu.Item parent-key={portalId} key={`karkuns-${portalId}`}>
      Karkuns
    </Menu.Item>,
    <Menu.Item parent-key={portalId} key={`visitors-${portalId}`}>
      Visitors
    </Menu.Item>,
    <Menu.Item parent-key={portalId} key={`attendance-sheets-${portalId}`}>
      Attendance Sheets
    </Menu.Item>,
    <Menu.Item parent-key={portalId} key={`amaanat-logs-${portalId}`}>
      Amaanat Logs
    </Menu.Item>,
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
              <span>
                <Icon type="shop" />
                {portal.name}
              </span>
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
