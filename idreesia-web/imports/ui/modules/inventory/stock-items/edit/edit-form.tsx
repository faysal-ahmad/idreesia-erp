import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Tabs } from 'antd';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
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

const AntTabs = Tabs as any;
const AntTabPane = Tabs.TabPane as any;
const GeneralInfoComponent = GeneralInfo as any;
const PictureComponent = Picture as any;
const IssuanceFormsComponent = IssuanceForms as any;
const PurchaseFormsComponent = PurchaseForms as any;
const AdjustmentsComponent = Adjustments as any;

interface RouteParams {
  physicalStoreId: string;
  stockItemId: string;
}

interface StockItem {
  _id: string;
  name: string;
}

interface StockItemData {
  stockItemById: StockItem;
}

type AnyProps = Record<string, any>;

const EditForm = (props: AnyProps) => {
  const dispatch = useDispatch();
  const { physicalStoreId, stockItemId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const { 
    itemCategoriesByPhysicalStoreId,
    itemCategoriesByPhysicalStoreIdLoading,
  } = usePhysicalStoreItemCategories(physicalStoreId);
  
  useEffect(() => {
    if (physicalStore) {
      dispatch(
        setBreadcrumbs(['Inventory', physicalStore.name, 'Stock Items', 'Edit'])
      );
    } else {
      dispatch(setBreadcrumbs(['Inventory', 'Stock Items', 'Edit']));
    }
  }, [dispatch, physicalStore]);

  const { data, loading } = useQuery(STOCK_ITEM_BY_ID as any, {
    variables: { _id: stockItemId, physicalStoreId },
  });

  if (loading || itemCategoriesByPhysicalStoreIdLoading) return null;
  const { stockItemById } = (data as StockItemData) ?? {};
  if (!stockItemById) return null;

  return (
    <AntTabs defaultActiveKey="1">
      <AntTabPane tab="General Info" key="1">
        <GeneralInfoComponent
          stockItemById={stockItemById}
          itemCategoriesByPhysicalStoreId={itemCategoriesByPhysicalStoreId}
          {...props}
        />
      </AntTabPane>
      <AntTabPane tab="Picture" key="2">
        <PictureComponent stockItemById={stockItemById} {...props} />
      </AntTabPane>
      <AntTabPane tab="Issuance Forms" key="3">
        <IssuanceFormsComponent stockItemId={stockItemId} physicalStoreId={physicalStoreId} {...props} />
      </AntTabPane>
      <AntTabPane tab="Purchase Forms" key="4">
        <PurchaseFormsComponent stockItemId={stockItemId} physicalStoreId={physicalStoreId} {...props} />
      </AntTabPane>
      <AntTabPane tab="Adjustments" key="5">
        <AdjustmentsComponent stockItemId={stockItemId} physicalStoreId={physicalStoreId} {...props} />
      </AntTabPane>
    </AntTabs>
  );
};

EditForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default EditForm;
