import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Layout } from 'antd';

import { ModuleNames } from '../constants';
import { InventorySidebar } from '../modules/inventory';

const { Sider } = Layout;

class SidebarContent extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    activeModuleName: PropTypes.string
  };

  render() {
    let sidebar;
    const { history, activeModuleName } = this.props;

    switch (activeModuleName) {
      case ModuleNames.inventory:
        sidebar = <InventorySidebar history={history} />;
        break;

      default:
        break;
    }

    return (
      <Sider width={200} style={{ background: '#fff' }}>
        {sidebar}
      </Sider>
    );
  }
}

const mapStateToProps = state => {
  return {
    activeModuleName: state.activeModuleName
  };
};

const SidebarContentContainer = connect(mapStateToProps)(SidebarContent);
export default SidebarContentContainer;
