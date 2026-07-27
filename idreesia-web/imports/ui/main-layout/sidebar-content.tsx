import React, { Suspense, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Button, Flex, Layout, Typography } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';

import { ModuleNames } from 'meteor/idreesia-common/constants';

const ReactSuspense = Suspense as any;
const AntButton = Button as any;
const AntFlex = Flex as any;
const AntLayout = Layout as any;
const AntTypography = Typography as any;
const AntMenuUnfoldOutlined = MenuUnfoldOutlined as any;
const AntMenuFoldOutlined = MenuFoldOutlined as any;
type AnyRecord = Record<string, any>;

const sidebarsMap: Record<string, any> = {
  [ModuleNames.admin]: React.lazy(() =>
    import('/imports/ui/modules/admin/sidebar').then(module => ({ default: module.default as any }))
  ),
  [ModuleNames.inventory]: React.lazy(() =>
    import('/imports/ui/modules/inventory/sidebar').then(module => ({ default: module.default as any }))
  ),
  [ModuleNames.hr]: React.lazy(() =>
    import('/imports/ui/modules/hr/sidebar').then(module => ({ default: module.default as any }))
  ),
  [ModuleNames.security]: React.lazy(() =>
    import('/imports/ui/modules/security/sidebar').then(module => ({ default: module.default as any }))
  ),
};

const SidebarContent = (props: AnyRecord) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const activeModuleName = useSelector((state: AnyRecord) => state.activeModuleName);
  const { history } = props;
  const ModuleSidebar = sidebarsMap[activeModuleName];

  let sidebar = <div />;
  if (ModuleSidebar) {
    sidebar = (
      <ReactSuspense fallback={<div />}>
        {React.createElement(ModuleSidebar as any, { history, collapsed: sidebarCollapsed })}
      </ReactSuspense>
    );
  }

  const handleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <AntFlex vertical>
      <AntFlex justify='center'>
        {
          sidebarCollapsed ? <div>&nbsp;</div> : (
            <AntTypography.Title ellipsis level={4}>{activeModuleName}</AntTypography.Title>
          )
        }
      </AntFlex>
      <AntLayout.Sider
        width={220}
        style={{ background: '#fff' }}
        collapsible
        trigger={null}
        collapsed={sidebarCollapsed}
        onCollapse={handleCollapse}
      >
        {sidebar}
      </AntLayout.Sider>
      <AntButton
        type="link"
        icon={sidebarCollapsed ? <AntMenuUnfoldOutlined /> : <AntMenuFoldOutlined />}
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        style={{ fontSize: '16px', width: 64, height: 64 }}
      />
    </AntFlex>
  );
};

SidebarContent.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default SidebarContent;
