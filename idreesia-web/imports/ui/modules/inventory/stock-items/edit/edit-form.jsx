import React from 'react';
import PropTypes from 'prop-types';
import { Tabs } from 'antd';

import { get, flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
} from '/imports/ui/modules/inventory/common/composers';

import GeneralInfo from './general-info';
import Picture from './picture';
import IssuanceForms from './issuance-forms';
import PurchaseForms from './purchase-forms';
import Adjustments from './adjustments';

const EditForm = props => {
  const stockItemId = get(props, ['match', 'params', 'stockItemId'], null);
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo stockItemId={stockItemId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Picture" key="2">
        <Picture stockItemId={stockItemId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Issuance Forms" key="3">
        <IssuanceForms stockItemId={stockItemId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Purchase Forms" key="4">
        <PurchaseForms stockItemId={stockItemId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Adjustments" key="5">
        <Adjustments stockItemId={stockItemId} {...props} />
      </Tabs.TabPane>
    </Tabs>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  physicalStoreId: PropTypes.string,
  physicalStore: PropTypes.object,
};

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Stock Items, Edit`;
    }
    return `Inventory, Stock Items, Edit`;
  })
)(EditForm);
