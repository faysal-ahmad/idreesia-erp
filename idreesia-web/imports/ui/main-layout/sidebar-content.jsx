import React, { Suspense, useState } from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';
import { useSelector } from 'react-redux';

import { ModuleNames } from 'meteor/idreesia-common/constants';

const sidebarsMap = {
  [ModuleNames.admin]: React.lazy(() =>
    import('/imports/ui/modules/admin/sidebar')
  ),
  [ModuleNames.inventory]: React.lazy(() =>
    import('/imports/ui/modules/inventory/sidebar')
  ),
  [ModuleNames.hr]: React.lazy(() => import('/imports/ui/modules/hr/sidebar')),
  [ModuleNames.accounts]: React.lazy(() =>
    import('/imports/ui/modules/accounts/sidebar')
  ),
  [ModuleNames.operations]: React.lazy(() =>
    import('/imports/ui/modules/operations/sidebar')
  ),
  [ModuleNames.security]: React.lazy(() =>
    import('/imports/ui/modules/security/sidebar')
  ),
  [ModuleNames.outstation]: React.lazy(() =>
    import('/imports/ui/modules/outstation/sidebar')
  ),
  [ModuleNames.portals]: React.lazy(() =>
    import('/imports/ui/modules/portals/sidebar')
  ),
};

const SidebarContent = props => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const activeModuleName = useSelector(state => state.activeModuleName);
  const { history } = props;
  const ModuleSidebar = sidebarsMap[activeModuleName];

  let sidebar = <div />;
  if (ModuleSidebar) {
    sidebar = (
      <Suspense fallback={<div />}>
        <ModuleSidebar history={history} />
      </Suspense>
    );
  }

  const handleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <Layout.Sider
      width={220}
      style={{ background: '#fff' }}
      collapsible
      collapsed={sidebarCollapsed}
      collapsedWidth={0}
      onCollapse={handleCollapse}
    >
      {sidebar}
    </Layout.Sider>
  );
};

SidebarContent.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default SidebarContent;
