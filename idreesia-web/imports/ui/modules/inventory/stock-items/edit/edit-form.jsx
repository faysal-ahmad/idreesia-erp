import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Tabs } from 'antd';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';

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

const EditForm = props => {
  const dispatch = useDispatch();
  const { physicalStoreId, stockItemId } = useParams();
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
  }, [physicalStore]);

  const { data, loading } = useQuery(STOCK_ITEM_BY_ID, {
    variables: { _id: stockItemId, physicalStoreId }
  });

  if (loading || itemCategoriesByPhysicalStoreIdLoading) return null;
  const { stockItemById } = data;

  return (
    <Tabs defaultActiveKey="1">
      <Tabs.TabPane tab="General Info" key="1">
        <GeneralInfo 
          stockItemById={stockItemById}
          itemCategoriesByPhysicalStoreId={itemCategoriesByPhysicalStoreId}
          {...props}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Picture" key="2">
        <Picture stockItemById={stockItemById} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Issuance Forms" key="3">
        <IssuanceForms stockItemId={stockItemId} physicalStoreId={physicalStoreId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Purchase Forms" key="4">
        <PurchaseForms stockItemId={stockItemId} physicalStoreId={physicalStoreId} {...props} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Adjustments" key="5">
        <Adjustments stockItemId={stockItemId} physicalStoreId={physicalStoreId} {...props} />
      </Tabs.TabPane>
    </Tabs>
  );
};

EditForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default EditForm;
