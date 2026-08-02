import React, { Suspense, useState } from 'react';
import { type History } from 'history';
import { useSelector } from 'react-redux';
import { Button, Flex, Layout, Typography } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';

import { ModuleNames } from 'meteor/idreesia-common/constants';

interface LayoutRootState {
  activeModuleName?: string | null;
}

interface ModuleSidebarProps {
  history: History;
}

type ModuleSidebarComponent = React.ComponentType<ModuleSidebarProps>;

interface Props {
  history: History;
}

const sidebarsMap: Record<
  string,
  React.LazyExoticComponent<ModuleSidebarComponent>
> = {
  [ModuleNames.admin]: React.lazy(
    () => import('/imports/ui/modules/admin/sidebar')
  ),
  [ModuleNames.inventory]: React.lazy(
    () => import('/imports/ui/modules/inventory/sidebar')
  ),
  [ModuleNames.hr]: React.lazy(() => import('/imports/ui/modules/hr/sidebar')),
  [ModuleNames.security]: React.lazy(
    () => import('/imports/ui/modules/security/sidebar')
  ),
};

const SidebarContent = ({ history }: Props) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const activeModuleName = useSelector(
    (state: LayoutRootState) => state.activeModuleName
  );
  const ModuleSidebar = activeModuleName
    ? sidebarsMap[activeModuleName]
    : undefined;

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
    <Flex vertical>
      <Flex justify="center">
        {sidebarCollapsed ? (
          <div>&nbsp;</div>
        ) : (
          <Typography.Title ellipsis level={4}>
            {activeModuleName}
          </Typography.Title>
        )}
      </Flex>
      <Layout.Sider
        width={220}
        style={{ background: '#fff' }}
        collapsible
        trigger={null}
        collapsed={sidebarCollapsed}
        onCollapse={handleCollapse}
      >
        {sidebar}
      </Layout.Sider>
      <Button
        type="link"
        icon={
          sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
        }
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        style={{ fontSize: '16px', width: 64, height: 64 }}
      />
    </Flex>
  );
};

export default SidebarContent;
