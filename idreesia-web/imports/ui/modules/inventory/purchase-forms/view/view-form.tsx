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

const AntTabs = Tabs as any;
const AntTabPane = Tabs.TabPane as any;
const PurchaseDetailsComponent = PurchasDetails as any;
const AttachmentsListComponent = AttachmentsList as any;

interface PhysicalStore {
  name: string;
}

type AnyProps = Record<string, any>;

const EditForm = (props: AnyProps) => {
  const formId = get(props, ['match', 'params', 'formId'], null);
  return (
    <AntTabs defaultActiveKey="1">
      <AntTabPane tab="Purchase Details" key="1">
        <PurchaseDetailsComponent purchaseFormId={formId} {...props} />
      </AntTabPane>
      <AntTabPane tab="Attachments" key="2">
        <AttachmentsListComponent purchaseFormId={formId} {...props} />
      </AntTabPane>
    </AntTabs>
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
  WithDynamicBreadcrumbs(({ physicalStore }: { physicalStore?: PhysicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Purchase Forms, View`;
    }
    return `Inventory, Purchase Forms, View`;
  })
)(EditForm as any);
