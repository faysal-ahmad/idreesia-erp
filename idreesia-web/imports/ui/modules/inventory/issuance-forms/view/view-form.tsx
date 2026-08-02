import React from 'react';
import { useQuery } from '@apollo/client/react';
import { useParams } from 'react-router-dom';
import { type RouteComponentProps } from 'react-router';
import { Tabs } from 'antd';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { usePhysicalStore } from '/imports/ui/modules/inventory/common/hooks';

import { IssuanceDetails } from './issuance-details';
import { AttachmentsList } from './attachments-list';
import { ISSUANCE_FORM_BY_ID } from '../gql';

const TabPane = Tabs.TabPane;

type RouteParams = {
  formId: string;
  physicalStoreId: string;
};

type Props = RouteComponentProps<RouteParams>;

const ViewForm = ({ history }: Props) => {
  const { formId, physicalStoreId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const { data, loading } = useQuery(ISSUANCE_FORM_BY_ID, {
    skip: !formId,
    variables: {
      _id: formId,
      physicalStoreId,
    },
  });

  useDynamicBreadcrumbs(
    physicalStore
      ? ['Inventory', physicalStore.name, 'Issuance Forms', 'View']
      : ['Inventory', 'Issuance Forms', 'View']
  );

  if (loading || !data?.issuanceFormById) {
    return null;
  }

  const issuanceFormById = data.issuanceFormById;

  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="Issuance Details" key="1">
        <IssuanceDetails
          history={history}
          physicalStoreId={physicalStoreId}
          issuanceFormById={issuanceFormById}
        />
      </TabPane>
      <TabPane tab="Attachments" key="2">
        <AttachmentsList issuanceFormById={issuanceFormById} />
      </TabPane>
    </Tabs>
  );
};

export default ViewForm;
