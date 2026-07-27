import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/client/react';
import { useParams } from 'react-router-dom';
import { Tabs } from 'antd';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import {
  usePhysicalStore,
  usePhysicalStoreLocations,
  usePhysicalStoreVendors,
} from '/imports/ui/modules/inventory/common/hooks';

import PurchasDetails from './purchase-details';
import AttachmentsList from './attachments-list';
import { PURCHASE_FORM_BY_ID } from '../gql';

const AntTabs = Tabs as any;
const AntTabPane = Tabs.TabPane as any;
const PurchaseDetailsComponent = PurchasDetails as any;
const AttachmentsListComponent = AttachmentsList as any;

interface RouteParams {
  formId: string;
  physicalStoreId: string;
}

interface PurchaseFormData {
  purchaseFormById: Record<string, unknown>;
}

type AnyProps = Record<string, any>;

const EditForm = (props: AnyProps) => {
  const dispatch = useDispatch();
  const { formId, physicalStoreId } = useParams<RouteParams>();
  const { physicalStore, physicalStoreLoading } = usePhysicalStore(physicalStoreId);
  const { locationsByPhysicalStoreId, locationsByPhysicalStoreIdLoading } = usePhysicalStoreLocations(physicalStoreId)
  const { vendorsByPhysicalStoreId, vendorsByPhysicalStoreIdLoading } = usePhysicalStoreVendors(physicalStoreId)
  const { data, loading } = useQuery(PURCHASE_FORM_BY_ID as any, {
    skip: !formId || !physicalStoreId,
    variables: {
      _id: formId,
      physicalStoreId,
    },
  });

  useEffect(() => {
    if (physicalStore) {
      dispatch(
        setBreadcrumbs(['Inventory', physicalStore.name, 'Purchase Forms', 'Edit'])
      );
    } else {
      dispatch(setBreadcrumbs(['Inventory', 'Purchase Forms', 'Edit']));
    }
  }, [dispatch, physicalStore]);

  if (
    loading ||
    physicalStoreLoading ||
    locationsByPhysicalStoreIdLoading ||
    vendorsByPhysicalStoreIdLoading ||
    !data
  ) return null;
  const { purchaseFormById } = data as PurchaseFormData;

  return (
    <AntTabs defaultActiveKey="1">
      <AntTabPane tab="Purchase Details" key="1">
        <PurchaseDetailsComponent
          purchaseFormId={formId}
          purchaseFormById={purchaseFormById}
          physicalStoreId={physicalStoreId}
          physicalStore={physicalStore}
          locationsByPhysicalStoreId={locationsByPhysicalStoreId}
          vendorsByPhysicalStoreId={vendorsByPhysicalStoreId}
          {...props}
        />
      </AntTabPane>
      <AntTabPane tab="Attachments" key="2">
        <AttachmentsListComponent
          purchaseFormId={formId}
          purchaseFormById={purchaseFormById}
          physicalStoreId={physicalStoreId}
          physicalStore={physicalStore}
          {...props}
        />
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

export default EditForm;
