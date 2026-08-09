import React from 'react';
import { useQuery } from '@apollo/client/react';
import { useParams } from 'react-router-dom';
import { type RouteComponentProps } from 'react-router';
import { Tabs } from 'antd';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { ModuleNames } from 'meteor/idreesia-common/constants';
import {
  usePhysicalStore,
  usePhysicalStoreLocations,
} from '/imports/ui/modules/stores/common/hooks';
import IssuanceDetails from './issuance-details';
import AttachmentsList from './attachments-list';
import { ISSUANCE_FORM_BY_ID } from '../gql';

type RouteParams = {
  formId: string;
  physicalStoreId: string;
};

type Props = RouteComponentProps<RouteParams>;

const EditForm = ({ history }: Props) => {
  const { formId, physicalStoreId } = useParams<RouteParams>();
  const { physicalStore, physicalStoreLoading } = usePhysicalStore(physicalStoreId);
  const { locationsByPhysicalStoreId, locationsByPhysicalStoreIdLoading } =
    usePhysicalStoreLocations(physicalStoreId);
  const { data, loading } = useQuery(ISSUANCE_FORM_BY_ID, {
    skip: !formId,
    variables: {
      _id: formId,
      physicalStoreId,
    },
  });

  useDynamicBreadcrumbs(
    physicalStore
      ? [ModuleNames.stores, physicalStore.name, 'Issuance Forms', 'Edit']
      : [ModuleNames.stores, 'Issuance Forms', 'Edit']
  );

  if (
    loading ||
    physicalStoreLoading ||
    locationsByPhysicalStoreIdLoading ||
    !data?.issuanceFormById
  ) {
    return null;
  }

  const issuanceFormById = data.issuanceFormById;

  return (
    <Tabs
      defaultActiveKey="1"
      items={[
        {
          key: '1',
          label: 'Issuance Details',
          children: (
            <IssuanceDetails
              history={history}
              issuanceFormById={issuanceFormById}
              physicalStoreId={physicalStoreId}
              locationsByPhysicalStoreId={(locationsByPhysicalStoreId ?? []).filter(
                (location) => location != null
              )}
            />
          ),
        },
        {
          key: '2',
          label: 'Attachments',
          children: (
            <AttachmentsList
              physicalStoreId={physicalStoreId}
              issuanceFormById={issuanceFormById}
            />
          ),
        },
      ]}
    />
  );
};

export default EditForm;
