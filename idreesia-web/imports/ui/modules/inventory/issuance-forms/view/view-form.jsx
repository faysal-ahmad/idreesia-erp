import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';
import { Tabs } from 'antd';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { usePhysicalStore } from '/imports/ui/modules/inventory/common/hooks';

import { IssuanceDetails } from './issuance-details';
import { AttachmentsList } from './attachments-list';
import { ISSUANCE_FORM_BY_ID } from '../gql';

const ViewForm = props => {
  const dispatch = useDispatch();
  const { formId, physicalStoreId } = useParams();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const { data, loading } = useQuery(ISSUANCE_FORM_BY_ID, {
    skip: !formId,
    variables: {
      _id: formId,
      physicalStoreId,
    },
  });

  useEffect(() => {
    if (physicalStore) {
      dispatch(
        setBreadcrumbs(['Inventory', physicalStore.name, 'Issuance Forms', 'View'])
      );
    } else {
      dispatch(setBreadcrumbs(['Inventory', 'Issuance Forms', 'View']));
    }
  }, [physicalStoreId]);
  
  if (loading || !data) return null;
  const { issuanceFormById } = data; 

  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="Issuance Details" key="1">
        <IssuanceDetails
          physicalStoreId={physicalStoreId}
          issuanceFormById={issuanceFormById}
          {...props}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Attachments" key="2">
        <AttachmentsList
          physicalStoreId={physicalStoreId}
          issuanceFormById={issuanceFormById}
          {...props}
        />
      </Tabs.TabPane>
    </Tabs>
  );
};

ViewForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default ViewForm;
