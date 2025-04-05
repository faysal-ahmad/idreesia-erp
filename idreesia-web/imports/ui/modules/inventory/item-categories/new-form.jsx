import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useMutation } from '@apollo/react-hooks';

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

const NewForm = ({ history }) => {
  const dispatch = useDispatch();
  const { physicalStoreId } = useParams();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createItemCategory] = useMutation(CREATE_ITEM_CATEGORY, {
    refetchQueries: [{ 
      query: ITEM_CATEGORIES_BY_PHYSICAL_STORE_ID,
      variables: {
        physicalStoreId,
      }
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
  }, [physicalStoreId]);

  const handleCancel = () => {
    history.push(paths.itemCategoriesPath(physicalStoreId));
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  }

  const handleFinish = ({ name }) => {
    createItemCategory({
      variables: { name, physicalStoreId },
    })
      .then(() => {
        message.success('New item category was created successfully.', 5);
        history.push(paths.itemCategoriesPath(physicalStoreId));
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please input a name for the item category."
      />
      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
}

NewForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default NewForm;
