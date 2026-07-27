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
} from '/imports/ui/modules/inventory/common/hooks';
import IssuanceDetails from './issuance-details';
import AttachmentsList from './attachments-list';
import { ISSUANCE_FORM_BY_ID } from '../gql';

const AntTabs = Tabs as any;
const AntTabPane = Tabs.TabPane as any;
const IssuanceDetailsComponent = IssuanceDetails as any;
const AttachmentsListComponent = AttachmentsList as any;
interface RouteParams { formId: string; physicalStoreId: string; }
interface IssuanceFormData { issuanceFormById: Record<string, unknown>; }
type AnyProps = Record<string, any>;

const EditForm = (props: AnyProps) => {
  const dispatch = useDispatch();
  const { formId, physicalStoreId } = useParams<RouteParams>();
  const { physicalStore, physicalStoreLoading } = usePhysicalStore(physicalStoreId);
  const { locationsByPhysicalStoreId, locationsByPhysicalStoreIdLoading } = usePhysicalStoreLocations(physicalStoreId)
  const { data, loading } = useQuery(ISSUANCE_FORM_BY_ID as any, {
    skip: !formId,
    variables: {
      _id: formId,
      physicalStoreId,
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
  }, [dispatch, physicalStore]);

  if (
    loading ||
    physicalStoreLoading ||
    locationsByPhysicalStoreIdLoading ||
    !data
  ) return null;
  const { issuanceFormById } = data as IssuanceFormData;

  return (
    <AntTabs defaultActiveKey="1">
      <AntTabPane tab="Issuance Details" key="1">
        <IssuanceDetailsComponent
          issuanceFormId={formId}
          issuanceFormById={issuanceFormById}
          physicalStoreId={physicalStoreId}
          physicalStore={physicalStore}
          locationsByPhysicalStoreId={locationsByPhysicalStoreId}
          {...props}
        />
      </AntTabPane>
      <AntTabPane tab="Attachments" key="2">
        <AttachmentsListComponent
          issuanceFormId={formId}
          issuanceFormById={issuanceFormById}
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
};

export default EditForm;
