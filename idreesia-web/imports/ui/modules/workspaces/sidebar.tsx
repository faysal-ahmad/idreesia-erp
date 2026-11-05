import React, { type CSSProperties } from 'react';
import { type History } from 'history';
import { Menu } from 'antd';
import { ClusterOutlined } from '@ant-design/icons';

import { useMyCommittees } from './hooks/use-my-committees';

const IconStyle: CSSProperties = {
  fontSize: '20px',
};

interface SidebarProps {
  history: History;
}

// Lists the committees the user is a member of. Committee sub-modules will be
// added as children of each committee node.
const Sidebar = (_props: SidebarProps) => {
  const { committees, loading } = useMyCommittees();

  if (loading) return null;

  const menuItems = committees.map((committee) => ({
    key: committee._id!,
    icon: <ClusterOutlined style={IconStyle} />,
    label: committee.name,
  }));

  return (
    <Menu
      mode="inline"
      selectable={false}
      style={{ height: '100%', borderRight: 0 }}
      items={menuItems}
    />
  );
};

export default Sidebar;
