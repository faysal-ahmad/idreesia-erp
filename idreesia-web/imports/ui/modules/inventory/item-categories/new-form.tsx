import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { usePhysicalStore } from '/imports/ui/modules/inventory/common/hooks';

import {
  CREATE_ITEM_CATEGORY,
  ITEM_CATEGORIES_BY_PHYSICAL_STORE_ID,
} from './gql';

const AntForm = Form as any;
const TextField = InputTextField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;

interface RouteParams {
  physicalStoreId: string;
}

interface HistoryLike {
  push(path: string): void;
}

interface NewFormProps {
  history: HistoryLike;
}

interface ItemCategoryFormValues {
  name: string;
}

const NewForm = ({ history }: NewFormProps) => {
  const dispatch = useDispatch();
  const { physicalStoreId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createItemCategory] = useMutation(CREATE_ITEM_CATEGORY as any, {
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
        setBreadcrumbs(['Inventory', physicalStore.name, 'Setup', 'Item Categories', 'New'])
      );
    } else {
      dispatch(setBreadcrumbs(['Inventory', 'Setup', 'Item Categories', 'New']));
    }
  }, [dispatch, physicalStore]);

  const handleCancel = () => {
    history.push(paths.itemCategoriesPath(physicalStoreId));
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name }: ItemCategoryFormValues) => {
    createItemCategory({
      variables: { name, physicalStoreId },
    })
      .then(() => {
        message.success('New item category was created successfully.', 5);
        history.push(paths.itemCategoriesPath(physicalStoreId));
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  return (
    <AntForm
      layout="horizontal"
      onFinish={handleFinish}
      onFieldsChange={handleFieldsChange}
    >
      <TextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please input a name for the item category."
      />
      <SaveCancelButtons
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </AntForm>
  );
};

NewForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default NewForm;
