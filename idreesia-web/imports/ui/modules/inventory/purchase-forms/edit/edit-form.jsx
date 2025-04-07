import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
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

const EditForm = props => {
  const dispatch = useDispatch();
  const { formId, physicalStoreId } = useParams();
  const { physicalStore, physicalStoreLoading } = usePhysicalStore(physicalStoreId);
  const { locationsByPhysicalStoreId, locationsByPhysicalStoreIdLoading } = usePhysicalStoreLocations(physicalStoreId)
  const { vendorsByPhysicalStoreId, vendorsByPhysicalStoreIdLoading } = usePhysicalStoreVendors(physicalStoreId)
  const { data, loading } = useQuery(PURCHASE_FORM_BY_ID, {
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
  }, [physicalStore]);

  if (
    loading ||
    physicalStoreLoading ||
    locationsByPhysicalStoreIdLoading ||
    vendorsByPhysicalStoreIdLoading ||
    !data
  ) return null;
  const { purchaseFormById } = data; 

  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="Purchase Details" key="1">
        <PurchasDetails
          purchaseFormId={formId}
          purchaseFormById={purchaseFormById}
          physicalStoreId={physicalStoreId}
          physicalStore={physicalStore}
          locationsByPhysicalStoreId={locationsByPhysicalStoreId}
          vendorsByPhysicalStoreId={vendorsByPhysicalStoreId}
          {...props}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Attachments" key="2">
        <AttachmentsList
          purchaseFormId={formId}
          purchaseFormById={purchaseFormById}
          physicalStoreId={physicalStoreId}
          physicalStore={physicalStore}
          {...props}
        />
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

export default EditForm;
