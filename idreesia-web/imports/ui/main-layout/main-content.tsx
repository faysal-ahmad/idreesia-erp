import React, { Suspense } from 'react';
import PropTypes from 'prop-types';
import { Layout } from 'antd';
import { useSelector } from 'react-redux';
import { ErrorBoundary } from 'react-error-boundary';

import { ModuleNames } from 'meteor/idreesia-common/constants';

const AntLayout = Layout as any;
const ReactSuspense = Suspense as any;
type ModuleKey = string;
type AnyRecord = Record<string, any>;

const routersMap: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
  [ModuleNames.admin]: React.lazy(() =>
    import('/imports/ui/modules/admin/router')
  ),
  [ModuleNames.inventory]: React.lazy(() =>
    import('/imports/ui/modules/inventory/router')
  ),
  [ModuleNames.hr]: React.lazy(() => import('/imports/ui/modules/hr/router')),
  [ModuleNames.security]: React.lazy(() =>
    import('/imports/ui/modules/security/router')
  ),
};

const MainContent = () => {
  const activeModuleName = useSelector((state: AnyRecord) => state.activeModuleName) as ModuleKey;
  const Router = routersMap[activeModuleName];

  let main = <div />;
  if (Router) {
    main = (
      <ReactSuspense fallback={<div />}>
        <ErrorBoundary fallbackRender={({ resetErrorBoundary}: { resetErrorBoundary(): void }) => {
          resetErrorBoundary();
          return <div />;
        }}
        >
          {React.createElement(Router as any)}
        </ErrorBoundary>
      </ReactSuspense>
    );
  }

  return (
    <AntLayout.Content
      style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}
    >
      {main}
    </AntLayout.Content>
  );
};

MainContent.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default MainContent;
