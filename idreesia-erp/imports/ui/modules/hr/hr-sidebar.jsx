import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Menu, Icon } from 'antd';

import { GlobalActionsCreator } from '/imports/ui/action-creators';
import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

const { SubMenu } = Menu;

class HRSidebar extends Component {
  static propTypes = {
    history: PropTypes.object,
    activeModuleName: PropTypes.string,
    setActiveSubModuleName: PropTypes.func
  };

  handleMenuItemSelected = ({ item, key, selectedKeys }) => {
    const { history, setActiveSubModuleName } = this.props;

    switch (key) {
      case 'duties':
        setActiveSubModuleName(SubModuleNames.duties);
        history.push(paths.dutiesPath);
        break;

      case 'duty-locations':
        setActiveSubModuleName(SubModuleNames.dutyLocations);
        history.push(paths.dutyLocationsPath);
        break;

      case 'karkuns':
        setActiveSubModuleName(SubModuleNames.karkuns);
        history.push(paths.karkunsPath);
        break;

      default:
        break;
    }
  };

  render() {
    return (
      <Menu
        mode="inline"
        defaultSelectedKeys={['home']}
        style={{ height: '100%', borderRight: 0 }}
        onSelect={this.handleMenuItemSelected}
      >
        <Menu.Item key="karkuns">Karkuns</Menu.Item>
        <SubMenu
          key="setup"
          title={
            <span>
              <Icon type="laptop" />Setup
            </span>
          }
        >
          <Menu.Item key="duties">Duties</Menu.Item>
          <Menu.Item key="duty-locations">Duty Locations</Menu.Item>
        </SubMenu>
      </Menu>
    );
  }
}

const mapStateToProps = state => {
  return {
    activeModuleName: state.activeModuleName
  };
};

const mapDispatchToProps = dispatch => {
  return {
    setActiveSubModuleName: subModuleName => {
      dispatch(GlobalActionsCreator.setActiveSubModuleName(subModuleName));
    }
  };
};

const HRSidebarContainer = connect(null, mapDispatchToProps)(HRSidebar);
export default HRSidebarContainer;
