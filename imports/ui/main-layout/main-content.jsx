import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Layout } from 'antd';

import { ModuleNames } from '../constants';
import { InventoryRouter } from '../inventory';

const { Content } = Layout;

class MainContent extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    activeModuleName: PropTypes.string,
    activeSubModuleName: PropTypes.string
  };

  render() {
    let main;
    const { activeModuleName } = this.props;

    switch (activeModuleName) {
      case ModuleNames.inventory:
        main = <InventoryRouter />;
        break;

      default:
        main = <div />;
        break;
    }

    return (
      <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
        {main}
      </Content>
    );
  }
}

const mapStateToProps = state => {
  return {
    activeModuleName: state.activeModuleName,
    activeSubModuleName: state.activeSubModuleName
  };
};

const MainContentContainer = connect(mapStateToProps)(MainContent);
export default MainContentContainer;