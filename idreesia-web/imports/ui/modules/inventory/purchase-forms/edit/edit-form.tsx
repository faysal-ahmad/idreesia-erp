import React from 'react';
import { useQuery } from '@apollo/client/react';
import { useParams } from 'react-router-dom';
import { type RouteComponentProps } from 'react-router';
import { Tabs } from 'antd';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import {
  usePhysicalStore,
  usePhysicalStoreLocations,
  usePhysicalStoreVendors,
} from '/imports/ui/modules/inventory/common/hooks';
import PurchaseDetails from './purchase-details';
import AttachmentsList from './attachments-list';
import { PURCHASE_FORM_BY_ID } from '../gql';

type RouteParams = { formId: string; physicalStoreId: string };
type Props = RouteComponentProps<RouteParams>;

const EditForm = ({ history }: Props) => {
  const { formId, physicalStoreId } = useParams<RouteParams>();
  const { physicalStore, physicalStoreLoading } = usePhysicalStore(physicalStoreId);
  const { locationsByPhysicalStoreId, locationsByPhysicalStoreIdLoading } =
    usePhysicalStoreLocations(physicalStoreId);
  const { vendorsByPhysicalStoreId, vendorsByPhysicalStoreIdLoading } =
    usePhysicalStoreVendors(physicalStoreId);
  const { data, loading } = useQuery(PURCHASE_FORM_BY_ID, {
    skip: !formId || !physicalStoreId,
    variables: { _id: formId, physicalStoreId },
  });

  useDynamicBreadcrumbs(
    physicalStore
      ? ['Inventory', physicalStore.name, 'Purchase Forms', 'Edit']
      : ['Inventory', 'Purchase Forms', 'Edit']
  );

  if (loading || physicalStoreLoading || locationsByPhysicalStoreIdLoading || vendorsByPhysicalStoreIdLoading || !data?.purchaseFormById) {
    return null;
  }

  return (
    <Tabs
      defaultActiveKey="1"
      items={[
        {
          key: '1',
          label: 'Purchase Details',
          children: (
            <PurchaseDetails
              history={history}
              purchaseFormById={data.purchaseFormById}
              physicalStoreId={physicalStoreId}
              locationsByPhysicalStoreId={(locationsByPhysicalStoreId ?? []).filter((l): l is NonNullable<typeof l> => l != null)}
              vendorsByPhysicalStoreId={(vendorsByPhysicalStoreId ?? []).filter((v): v is NonNullable<typeof v> => v != null)}
            />
          ),
        },
        {
          key: '2',
          label: 'Attachments',
          children: (
            <AttachmentsList
              physicalStoreId={physicalStoreId}
              purchaseFormById={data.purchaseFormById}
            />
          ),
        },
      ]}
    />
  );
};

export default EditForm;
