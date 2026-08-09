import React, { useState } from 'react';
import { Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client/react';
import { type History } from 'history';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';
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

interface EditFormProps {
  history: History;
}

interface ItemCategoryFormValues {
  name: string;
}

const EditForm = ({ history }: EditFormProps) => {
  const { physicalStoreId, itemCategoryId } = useParams<{
    physicalStoreId: string;
    itemCategoryId: string;
  }>();
  const { physicalStore } = usePhysicalStore(physicalStoreId!);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [updateItemCategory] = useMutation(UPDATE_ITEM_CATEGORY, {
    refetchQueries: [{
      query: ITEM_CATEGORIES_BY_PHYSICAL_STORE_ID,
      variables: {
        physicalStoreId,
      },
    }],
  });

  useDynamicBreadcrumbs(
    physicalStore
      ? ['Inventory', physicalStore.name ?? '', 'Setup', 'Item Categories', 'Edit']
      : ['Inventory', 'Setup', 'Item Categories', 'Edit']
  );

  const { data, loading } = useQuery(ITEM_CATEGORY_BY_ID, {
    variables: { _id: itemCategoryId!, physicalStoreId: physicalStoreId! },
  });

  if (loading) return null;
  const itemCategoryById = data?.itemCategoryById;
  if (!itemCategoryById) return null;

  const handleCancel = () => {
    history.push(paths.itemCategoriesPath(physicalStoreId!));
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name }: ItemCategoryFormValues) => {
    updateItemCategory({
      variables: {
        _id: itemCategoryById._id!,
        physicalStoreId: physicalStoreId!,
        name,
      },
    })
      .then(() => {
        message.success('Item category was updated successfully.', 5);
        history.push(paths.itemCategoriesPath(physicalStoreId!));
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  return (
    <>
      <Form
        layout="horizontal"
        onFinish={handleFinish}
        onFieldsChange={handleFieldsChange}
      >
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={itemCategoryById.name ?? undefined}
          required
          requiredMessage="Please input a name for the item category."
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={itemCategoryById} />
    </>
  );
};

export default EditForm;
