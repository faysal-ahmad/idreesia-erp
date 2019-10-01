import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Icon, Menu, NavBar } from 'antd-mobile';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithActiveModule } from 'meteor/idreesia-common/composers/common';
import { GlobalActionsCreator } from '/imports/ui/action-creators';

import {
  SecurityRouter,
  SecuritySubModuleNames,
  SecuritySubModulePaths,
} from '/imports/ui/modules/security';

const data = [
  {
    label: 'Security',
    value: 'security',
    children: [
      {
        label: 'Visitor Registration',
        value: 'visitorRegistration',
      },
    ],
  },
  {
    label: 'Account',
    value: 'account',
    children: [
      {
        label: 'Login',
        value: 'accountLogin',
      },
    ],
  },
];

class HeaderContent extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    activeModuleName: PropTypes.string,
    activeSubModuleName: PropTypes.string,
    setActiveModuleAndSubModuleName: PropTypes.func,
  };

  state = {
    show: false,
  };

  routerMapping = {
    security: <SecurityRouter />,
  };

  onMaskClick = () => {
    this.setState({ show: false });
  };

  handleClick = e => {
    e.preventDefault();
    const { show } = this.state;
    this.setState({
      show: !show,
    });
  };

  handleOnChange = value => {
    const moduleName = value[0];
    const subModuleName = value[1];
    this.setState({ show: false });

    const { history, setActiveModuleAndSubModuleName } = this.props;
    setActiveModuleAndSubModuleName(moduleName, subModuleName);
    history.push(SecuritySubModulePaths.visitorRegistrationNewFormPath);
  };

  getSubModuleDisplayName = () => {
    const { activeModuleName, activeSubModuleName } = this.props;
    if (activeModuleName === 'security') {
      return SecuritySubModuleNames[activeSubModuleName];
    }

    return 'Idreesia ERP';
  };

  render() {
    const { show } = this.state;
    const { activeModuleName } = this.props;
    const activeModuleRouter = this.routerMapping[activeModuleName];
    const title = this.getSubModuleDisplayName();

    const menu = (
      <Menu
        className="header-content-menu"
        data={data}
        onChange={this.handleOnChange}
        height={document.documentElement.clientHeight * 0.6}
      />
    );

    return (
      <>
        <div className={show ? 'menu-active' : ''}>
          <div>
            <NavBar
              icon={<Icon type="ellipsis" />}
              onLeftClick={this.handleClick}
              className="top-nav-bar"
            >
              {title}
            </NavBar>
          </div>
          {show ? menu : null}
          {show ? (
            <div className="menu-mask" onClick={this.onMaskClick} />
          ) : null}
        </div>
        {activeModuleRouter}
      </>
    );
  }
}

const mapDispatchToProps = dispatch => ({
  setActiveModuleAndSubModuleName: (moduleName, subModuleName) => {
    dispatch(
      GlobalActionsCreator.setActiveModuleAndSubModuleName(
        moduleName,
        subModuleName
      )
    );
  },
});

export default flowRight(
  WithActiveModule(),
  connect(
    null,
    mapDispatchToProps
  )
)(HeaderContent);
