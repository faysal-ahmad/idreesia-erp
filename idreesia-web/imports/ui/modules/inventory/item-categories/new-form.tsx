import React, { useState } from 'react';
import { Form, message } from 'antd';
import { useParams } from 'react-router-dom';
import { useMutation } from '@apollo/client/react';
import { type History } from 'history';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
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

interface NewFormProps {
  history: History;
}

interface ItemCategoryFormValues {
  name: string;
}

const NewForm = ({ history }: NewFormProps) => {
  const { physicalStoreId } = useParams<{ physicalStoreId: string }>();
  const { physicalStore } = usePhysicalStore(physicalStoreId!);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createItemCategory] = useMutation(CREATE_ITEM_CATEGORY, {
    refetchQueries: [{
      query: ITEM_CATEGORIES_BY_PHYSICAL_STORE_ID,
      variables: {
        physicalStoreId,
      },
    }],
  });

  useDynamicBreadcrumbs(
    physicalStore
      ? ['Inventory', physicalStore.name ?? '', 'Setup', 'Item Categories', 'New']
      : ['Inventory', 'Setup', 'Item Categories', 'New']
  );

  const handleCancel = () => {
    history.push(paths.itemCategoriesPath(physicalStoreId!));
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name }: ItemCategoryFormValues) => {
    createItemCategory({
      variables: { name, physicalStoreId: physicalStoreId! },
    })
      .then(() => {
        message.success('New item category was created successfully.', 5);
        history.push(paths.itemCategoriesPath(physicalStoreId!));
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  return (
    <Form
      layout="horizontal"
      onFinish={handleFinish}
      onFieldsChange={handleFieldsChange}
    >
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
};

export default NewForm;
