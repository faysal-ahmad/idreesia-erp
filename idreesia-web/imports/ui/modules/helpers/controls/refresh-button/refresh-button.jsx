import React from 'react';
import PropTypes from 'prop-types';
import { SyncOutlined } from '@ant-design/icons';

import { Tooltip, message } from 'antd';

const RefreshButton = ({ refreshData }) => {
  if (!refreshData) return null;
  return (
    <Tooltip title="Reload Data">
      <SyncOutlined
        onClick={event => {
          event.stopPropagation();
          if (refreshData) {
            refreshData().then(() => {
              message.success('Data Reloaded', 2);
            });
          }
        }}
      />
    </Tooltip>
  );
};

RefreshButton.propTypes = {
  refreshData: PropTypes.func,
};

export default RefreshButton;
