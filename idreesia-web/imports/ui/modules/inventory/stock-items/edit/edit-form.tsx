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

const TabPane = Tabs.TabPane;

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
    <Tabs defaultActiveKey="1">
      <TabPane tab="General Info" key="1">
        <GeneralInfo
          history={history}
          stockItemById={stockItemById}
          itemCategoriesByPhysicalStoreId={categories}
        />
      </TabPane>
      <TabPane tab="Picture" key="2">
        <Picture stockItemById={stockItemById} />
      </TabPane>
      <TabPane tab="Issuance Forms" key="3">
        <IssuanceForms
          history={history}
          stockItemId={stockItemId}
          physicalStoreId={physicalStoreId}
        />
      </TabPane>
      <TabPane tab="Purchase Forms" key="4">
        <PurchaseForms
          history={history}
          stockItemId={stockItemId}
          physicalStoreId={physicalStoreId}
        />
      </TabPane>
      <TabPane tab="Adjustments" key="5">
        <Adjustments
          history={history}
          stockItemId={stockItemId}
          physicalStoreId={physicalStoreId}
        />
      </TabPane>
    </Tabs>
  );
};

export default EditForm;
