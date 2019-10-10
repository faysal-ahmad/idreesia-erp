import React, { Suspense } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { ModuleNames } from 'meteor/idreesia-common/constants';
import { Layout } from './antd-controls';

const sidebarsMap = {
  [ModuleNames.admin]: React.lazy(() =>
    import('/imports/ui/modules/admin/admin-sidebar')
  ),
  [ModuleNames.inventory]: React.lazy(() =>
    import('/imports/ui/modules/inventory/inventory-sidebar')
  ),
  [ModuleNames.hr]: React.lazy(() =>
    import('/imports/ui/modules/hr/hr-sidebar')
  ),
  [ModuleNames.accounts]: React.lazy(() =>
    import('/imports/ui/modules/accounts/accounts-sidebar')
  ),
  [ModuleNames.security]: React.lazy(() =>
    import('/imports/ui/modules/security/security-sidebar')
  ),
};

const SidebarContent = props => {
  const { activeModuleName, history } = props;
  const ModuleSidebar = sidebarsMap[activeModuleName];

  let sidebar = <div />;
  if (ModuleSidebar) {
    sidebar = (
      <Suspense fallback={<div />}>
        <ModuleSidebar history={history} />
      </Suspense>
    );
  }

  return (
    <Layout.Sider width={220} style={{ background: '#fff' }}>
      {sidebar}
    </Layout.Sider>
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