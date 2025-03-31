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
} from '/imports/ui/modules/inventory/common/hooks';
import IssuanceDetails from './issuance-details';
import AttachmentsList from './attachments-list';
import { ISSUANCE_FORM_BY_ID } from '../gql';

const EditForm = props => {
  const dispatch = useDispatch();
  const { formId, physicalStoreId } = useParams();
  const { physicalStore, physicalStoreLoading } = usePhysicalStore(physicalStoreId);
  const { locationsByPhysicalStoreId, locationsByPhysicalStoreIdLoading } = usePhysicalStoreLocations(physicalStoreId)
  const { data, loading } = useQuery(ISSUANCE_FORM_BY_ID, {
    skip: !formId,
    variables: {
      _id: formId,
    },
  });

  useEffect(() => {
    if (physicalStore) {
      dispatch(
        setBreadcrumbs(['Inventory', physicalStore.name, 'Issuance Forms', 'Edit'])
      );
    } else {
      dispatch(setBreadcrumbs(['Inventory', 'Issuance Forms', 'Edit']));
    }
  }, [physicalStoreId]);

  if (
    loading ||
    physicalStoreLoading ||
    locationsByPhysicalStoreIdLoading ||
    !data
  ) return null;
  const { issuanceFormById } = data; 

  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="Issuance Details" key="1">
        <IssuanceDetails
          issuanceFormId={formId}
          issuanceFormById={issuanceFormById}
          physicalStoreId={physicalStoreId}
          physicalStore={physicalStore}
          locationsByPhysicalStoreId={locationsByPhysicalStoreId}
          {...props}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Attachments" key="2">
        <AttachmentsList
          issuanceFormId={formId}
          issuanceFormById={issuanceFormById}
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
};

export default EditForm;
