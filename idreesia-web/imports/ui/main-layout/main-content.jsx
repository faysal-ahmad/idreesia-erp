import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { ModuleNames } from 'meteor/idreesia-common/constants';
import { Layout } from './antd-controls';

const routersMap = {
  [ModuleNames.admin]: React.lazy(() =>
    import('/imports/ui/modules/admin/admin-router')
  ),
  [ModuleNames.inventory]: React.lazy(() =>
    import('/imports/ui/modules/inventory/inventory-router')
  ),
  [ModuleNames.hr]: React.lazy(() =>
    import('/imports/ui/modules/hr/hr-router')
  ),
  [ModuleNames.accounts]: React.lazy(() =>
    import('/imports/ui/modules/accounts/accounts-router')
  ),
  [ModuleNames.security]: React.lazy(() =>
    import('/imports/ui/modules/security/security-router')
  ),
  [ModuleNames.portals]: React.lazy(() =>
    import('/imports/ui/modules/portals/portals-router')
  ),
};

const MainContent = () => {
  const activeModuleName = useSelector(state => state.activeModuleName);
  const Router = routersMap[activeModuleName];

  let main = <div />;
  if (Router) {
    main = (
      <Suspense fallback={<div />}>
        <Router />
      </Suspense>
    );
  }

  return (
    <Layout.Content
      style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}
    >
      {main}
    </Layout.Content>
  );
};

MainContent.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default MainContent;
