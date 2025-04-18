import React from 'react';
import PropTypes from 'prop-types';

import { flowRight, get } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Tabs } from 'antd';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
} from '/imports/ui/modules/inventory/common/composers';

import PurchasDetails from './purchase-details';
import AttachmentsList from './attachments-list';

const EditForm = props => {
  const formId = get(props, ['match', 'params', 'formId'], null);
  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="Purchase Details" key="1">
        <PurchasDetails purchaseFormId={formId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Attachments" key="2">
        <AttachmentsList purchaseFormId={formId} {...props} />
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
      return `Inventory, ${physicalStore.name}, Purchase Forms, View`;
    }
    return `Inventory, Purchase Forms, View`;
  })
)(EditForm);
