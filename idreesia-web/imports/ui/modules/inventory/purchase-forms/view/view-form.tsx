import React from 'react';
import { useQuery } from '@apollo/client/react';
import { useParams } from 'react-router-dom';
import { type RouteComponentProps } from 'react-router';
import { Tabs } from 'antd';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { usePhysicalStore } from '/imports/ui/modules/inventory/common/hooks';
import PurchaseDetails from './purchase-details';
import { AttachmentsList } from './attachments-list';
import { PURCHASE_FORM_BY_ID } from '../gql';

const TabPane = Tabs.TabPane;
type RouteParams = { formId: string; physicalStoreId: string };
type Props = RouteComponentProps<RouteParams>;

const ViewForm = ({ history }: Props) => {
  const { formId, physicalStoreId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const { data, loading } = useQuery(PURCHASE_FORM_BY_ID, {
    skip: !formId,
    variables: { _id: formId, physicalStoreId },
  });

  useDynamicBreadcrumbs(
    physicalStore
      ? ['Inventory', physicalStore.name, 'Purchase Forms', 'View']
      : ['Inventory', 'Purchase Forms', 'View']
  );

  if (loading || !data?.purchaseFormById) return null;

  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="Purchase Details" key="1">
        <PurchaseDetails history={history} physicalStoreId={physicalStoreId} purchaseFormById={data.purchaseFormById} />
      </TabPane>
      <TabPane tab="Attachments" key="2">
        <AttachmentsList purchaseFormById={data.purchaseFormById} />
      </TabPane>
    </Tabs>
  );
};

export default ViewForm;
