import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Layout } from 'antd';

import { ModuleNames } from 'meteor/idreesia-common/constants';
import { AdminSidebar } from '../modules/admin';
import { InventorySidebar } from '../modules/inventory';
import { HRSidebar } from '../modules/hr';
import { AccountsSidebar } from '../modules/accounts';
import { SecuritySidebar } from '../modules/security';

const { Sider } = Layout;

const SidebarContent = props => {
  let sidebar;
  const { history, activeModuleName } = props;

  switch (activeModuleName) {
    case ModuleNames.admin:
      sidebar = <AdminSidebar history={history} />;
      break;

    case ModuleNames.inventory:
      sidebar = <InventorySidebar history={history} />;
      break;

    case ModuleNames.hr:
      sidebar = <HRSidebar history={history} />;
      break;

    case ModuleNames.accounts:
      sidebar = <AccountsSidebar history={history} />;
      break;

    case ModuleNames.security:
      sidebar = <SecuritySidebar history={history} />;
      break;

    default:
      break;
  }

  return (
    <Sider width={220} style={{ background: '#fff' }}>
      {sidebar}
    </Sider>
  );
};

SidebarContent.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  activeModuleName: PropTypes.string,
};

const mapStateToProps = state => ({
  activeModuleName: state.activeModuleName,
});

const SidebarContentContainer = connect(mapStateToProps)(SidebarContent);
export default SidebarContentContainer;
