import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { AuditInfo } from '/imports/ui/modules/common';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import { usePhysicalStore } from '/imports/ui/modules/inventory/common/hooks';

import {
  ITEM_CATEGORY_BY_ID,
  ITEM_CATEGORIES_BY_PHYSICAL_STORE_ID,
  UPDATE_ITEM_CATEGORY,
} from './gql';

const AntForm = Form as any;
const TextField = InputTextField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
const AuditInfoComponent = AuditInfo as any;

interface RouteParams {
  physicalStoreId: string;
  itemCategoryId: string;
}

interface HistoryLike {
  push(path: string): void;
}

interface EditFormProps {
  history: HistoryLike;
}

interface ItemCategory {
  _id: string;
  name: string;
}

interface ItemCategoryData {
  itemCategoryById: ItemCategory;
}

interface ItemCategoryFormValues {
  name: string;
}

const EditForm = ({ history }: EditFormProps) => {
  const dispatch = useDispatch();
  const { physicalStoreId, itemCategoryId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [updateItemCategory] = useMutation(UPDATE_ITEM_CATEGORY as any, {
    refetchQueries: [{
      query: ITEM_CATEGORIES_BY_PHYSICAL_STORE_ID as any,
      variables: {
        physicalStoreId,
      },
    }],
  });
  
  useEffect(() => {
    if (physicalStore) {
      dispatch(
        setBreadcrumbs(['Inventory', physicalStore.name, 'Setup', 'Item Categories', 'Edit'])
      );
    } else {
      dispatch(setBreadcrumbs(['Inventory', 'Setup', 'Item Categories', 'Edit']));
    }
  }, [dispatch, physicalStore]);

  const { data, loading } = useQuery(ITEM_CATEGORY_BY_ID as any, {
    variables: { _id: itemCategoryId, physicalStoreId },
  });

  if (loading) return null;
  const { itemCategoryById } = (data as ItemCategoryData) ?? {};
  if (!itemCategoryById) return null;

  const handleCancel = () => {
    history.push(paths.itemCategoriesPath(physicalStoreId));
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name }: ItemCategoryFormValues) => {
    updateItemCategory({
      variables: {
        _id: itemCategoryById._id,
        physicalStoreId,
        name,
      },
    })
      .then(() => {
        message.success('Item category was updated successfully.', 5);
        history.push(paths.itemCategoriesPath(physicalStoreId));
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  return (
    <>
      <AntForm
        layout="horizontal"
        onFinish={handleFinish}
        onFieldsChange={handleFieldsChange}
      >
        <TextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={itemCategoryById.name}
          required
          requiredMessage="Please input a name for the item category."
        />
        <SaveCancelButtons
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </AntForm>
      <AuditInfoComponent record={itemCategoryById} />
    </>
  );
};

EditForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default EditForm;
