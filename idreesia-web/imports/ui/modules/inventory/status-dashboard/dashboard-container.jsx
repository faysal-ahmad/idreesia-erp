import React from 'react';
import PropTypes from 'prop-types';
import { flowRight } from 'lodash';

import { WithDynamicBreadcrumbs } from '/imports/ui/composers';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
} from '/imports/ui/modules/inventory/common/composers';

import Dashboard from './dashboard';

const DashboardContainer = props => {
  const { physicalStoreId, physicalStoreLoading, physicalStore } = props;
  if (physicalStoreLoading) return null;

  return (
    <Dashboard
      physicalStoreId={physicalStoreId}
      physicalStore={physicalStore}
    />
  );
};

DashboardContainer.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  physicalStoreId: PropTypes.string,
  physicalStoreLoading: PropTypes.bool,
  physicalStore: PropTypes.object,
};

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Status Dashboard`;
    }
    return `Inventory, Status Dashboard`;
  })
)(DashboardContainer);
