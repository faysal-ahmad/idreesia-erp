import React from 'react';
import PropTypes from 'prop-types';

import { Icon, Tooltip, message } from '/imports/ui/controls';

const RefreshButton = ({ refreshData }) => {
  if (!refreshData) return null;
  return (
    <Tooltip title="Reload Data">
      <Icon
        type="sync"
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
