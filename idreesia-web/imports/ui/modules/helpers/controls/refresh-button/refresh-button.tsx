import React from 'react';
import PropTypes from 'prop-types';
import { SyncOutlined } from '@ant-design/icons';

import { Tooltip, message } from 'antd';

const AntTooltip = Tooltip as any;
const AntSyncOutlined = SyncOutlined as any;
interface Props { refreshData?(): Promise<unknown>; }

const RefreshButton = ({ refreshData }: Props) => {
  if (!refreshData) return null;
  return (
    <AntTooltip title="Reload Data">
      <AntSyncOutlined
        onClick={(event: React.MouseEvent) => {
          event.stopPropagation();
          if (refreshData) {
            refreshData().then(() => {
              message.success('Data Reloaded', 2);
            });
          }
        }}
      />
    </AntTooltip>
  );
};

RefreshButton.propTypes = {
  refreshData: PropTypes.func,
};

export default RefreshButton;
