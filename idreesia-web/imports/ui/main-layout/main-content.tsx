import React, { Suspense } from 'react';
import { Layout } from 'antd';
import { useSelector } from 'react-redux';
import { ErrorBoundary } from 'react-error-boundary';

import { ModuleNames } from 'meteor/idreesia-common/constants';

interface LayoutRootState {
  activeModuleName?: string | null;
}

type ModuleRouterComponent = React.ComponentType;

const routersMap: Record<
  string,
  React.LazyExoticComponent<ModuleRouterComponent>
> = {
  [ModuleNames.admin]: React.lazy(
    () => import('/imports/ui/modules/admin/router')
  ),
  [ModuleNames.stores]: React.lazy(
    () => import('/imports/ui/modules/stores/router')
  ),
  [ModuleNames.hr]: React.lazy(() => import('/imports/ui/modules/hr/router')),
  [ModuleNames.security]: React.lazy(
    () => import('/imports/ui/modules/security/router')
  ),
};

const MainContent = () => {
  const activeModuleName = useSelector(
    (state: LayoutRootState) => state.activeModuleName
  );
  const Router = activeModuleName ? routersMap[activeModuleName] : undefined;

  let main = <div />;
  if (Router) {
    main = (
      <Suspense fallback={<div />}>
        <ErrorBoundary
          fallbackRender={({ error }) => (
            <div style={{ padding: 24 }}>
              <h3>Something went wrong</h3>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {error?.message ?? String(error)}
              </pre>
            </div>
          )}
        >
          <Router />
        </ErrorBoundary>
      </Suspense>
    );
  }

  return (
    <Layout.Content
      className="app-shell-main"
      style={{ background: '#fff', padding: 24, margin: 0 }}
    >
      {main}
    </Layout.Content>
  );
};

export default MainContent;
