import React from 'react';
import { type RouteComponentProps } from 'react-router';
import { useParams } from 'react-router-dom';
import { Tabs } from 'antd';
import { useQuery } from '@apollo/client/react';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import {
  usePhysicalStore,
  usePhysicalStoreItemCategories,
} from '/imports/ui/modules/inventory/common/hooks';

import GeneralInfo from './general-info';
import Picture from './picture';
import IssuanceForms from './issuance-forms';
import PurchaseForms from './purchase-forms';
import Adjustments from './adjustments';
import { STOCK_ITEM_BY_ID } from '../gql';

type Props = RouteComponentProps;

const EditForm = ({ history }: Props) => {
  const { physicalStoreId = '', stockItemId = '' } = useParams<{
    physicalStoreId: string;
    stockItemId: string;
  }>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const {
    itemCategoriesByPhysicalStoreId,
    itemCategoriesByPhysicalStoreIdLoading,
  } = usePhysicalStoreItemCategories(physicalStoreId);

  useDynamicBreadcrumbs(
    physicalStore
      ? ['Inventory', physicalStore.name ?? '', 'Stock Items', 'Edit']
      : ['Inventory', 'Stock Items', 'Edit']
  );

  const { data, loading } = useQuery(STOCK_ITEM_BY_ID, {
    variables: { _id: stockItemId, physicalStoreId },
    skip: !stockItemId || !physicalStoreId,
  });

  if (loading || itemCategoriesByPhysicalStoreIdLoading) return null;
  const stockItemById = data?.stockItemById;
  if (!stockItemById) return null;

  const categories = (itemCategoriesByPhysicalStoreId ?? []).filter(
    (category): category is NonNullable<typeof category> => category != null
  );

  return (
    <Tabs
      defaultActiveKey="1"
      items={[
        {
          key: '1',
          label: 'General Info',
          children: (
            <GeneralInfo
              history={history}
              stockItemById={stockItemById}
              itemCategoriesByPhysicalStoreId={categories}
            />
          ),
        },
        {
          key: '2',
          label: 'Picture',
          children: <Picture stockItemById={stockItemById} />,
        },
        {
          key: '3',
          label: 'Issuance Forms',
          children: (
            <IssuanceForms
              history={history}
              stockItemId={stockItemId}
              physicalStoreId={physicalStoreId}
            />
          ),
        },
        {
          key: '4',
          label: 'Purchase Forms',
          children: (
            <PurchaseForms
              history={history}
              stockItemId={stockItemId}
              physicalStoreId={physicalStoreId}
            />
          ),
        },
        {
          key: '5',
          label: 'Adjustments',
          children: (
            <Adjustments
              history={history}
              stockItemId={stockItemId}
              physicalStoreId={physicalStoreId}
            />
          ),
        },
      ]}
    />
  );
};

export default EditForm;
