import React from 'react';
import { SyncOutlined } from '@ant-design/icons';

import { Tooltip } from 'antd';
import { message } from '/imports/ui/antd-feedback';

interface Props {
  refreshData?(): Promise<unknown>;
}

const RefreshButton = ({ refreshData }: Props) => {
  if (!refreshData) return null;
  return (
    <Tooltip title="Reload Data">
      <SyncOutlined
        onClick={(event: React.MouseEvent) => {
          event.stopPropagation();
          refreshData().then(() => {
            message.success('Data Reloaded', 2);
          });
        }}
      />
    </Tooltip>
  );
};

export default RefreshButton;
