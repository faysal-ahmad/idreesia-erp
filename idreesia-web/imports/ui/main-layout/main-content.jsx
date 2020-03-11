import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { ModuleNames } from 'meteor/idreesia-common/constants';
import { Layout } from './antd-controls';

const routersMap = {
  [ModuleNames.admin]: React.lazy(() =>
    import('/imports/ui/modules/admin/router')
  ),
  [ModuleNames.inventory]: React.lazy(() =>
    import('/imports/ui/modules/inventory/router')
  ),
  [ModuleNames.hr]: React.lazy(() => import('/imports/ui/modules/hr/router')),
  [ModuleNames.accounts]: React.lazy(() =>
    import('/imports/ui/modules/accounts/router')
  ),
  [ModuleNames.wazaifManagement]: React.lazy(() =>
    import('/imports/ui/modules/wazaif-management/router')
  ),
  [ModuleNames.telephoneRoom]: React.lazy(() =>
    import('/imports/ui/modules/telephone-room/router')
  ),
  [ModuleNames.security]: React.lazy(() =>
    import('/imports/ui/modules/security/router')
  ),
  [ModuleNames.outstation]: React.lazy(() =>
    import('/imports/ui/modules/outstation/router')
  ),
  [ModuleNames.portals]: React.lazy(() =>
    import('/imports/ui/modules/portals/router')
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
