import React, { useState } from 'react';
import { type RouteComponentProps } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client/react';
import { Collapse, Empty, Form, Spin } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import {
  FormButtonsSaveCancel,
  InputNumberField,
  InputTextAreaField,
  InputTextField,
} from '/imports/ui/modules/helpers/fields';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

import { default as paths } from '../submodule-paths';
import Picture from './picture';
import {
  PURCHASING_CATALOG_ITEM_BY_ID,
  UPDATE_PURCHASING_CATALOG_ITEM,
} from './gql';

interface FormValues {
  name: string;
  unit: string;
  category?: string;
  company?: string;
  description?: string;
  defaultUnitPrice?: number | null;
}

const SECTION_KEYS = ['general', 'picture', 'pricing'];

const EditForm = ({
  match,
  history,
}: RouteComponentProps<{ itemId: string }>) => {
  const { itemId } = match.params;
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);

  const { data, loading } = useQuery(PURCHASING_CATALOG_ITEM_BY_ID, {
    variables: { _id: itemId },
    fetchPolicy: 'cache-and-network',
  });
  const [updateItem] = useMutation(UPDATE_PURCHASING_CATALOG_ITEM, {
    refetchQueries: ['pagedPurchasingCatalogItems'],
  });
  const item = data?.purchasingCatalogItemById;

  useDynamicBreadcrumbs([
    'Purchasing',
    'Catalog',
    item?.name?.trim() || 'Edit',
  ]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!item?._id) {
    return (
      <Empty description="Catalog item not found" style={{ padding: '80px 0' }} />
    );
  }

  const handleCancel = () => {
    history.push(paths.catalogPath);
  };

  const handleFinish = (values: FormValues) => {
    updateItem({
      variables: {
        _id: item._id!,
        name: values.name,
        unit: values.unit,
        category: values.category,
        company: values.company,
        description: values.description,
        defaultUnitPrice: values.defaultUnitPrice ?? undefined,
      },
    })
      .then(() => {
        setIsFieldsTouched(false);
        message.success('Catalog item saved', 2);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const items = [
    {
      key: 'general',
      label: 'General',
      forceRender: true,
      children: (
        <>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={item.name}
            required
            requiredMessage="Please input the item name."
          />
          <InputTextField
            fieldName="unit"
            fieldLabel="Unit"
            initialValue={item.unit}
            required
            requiredMessage="Please input the unit (e.g. kg, box)."
          />
          <InputTextField
            fieldName="category"
            fieldLabel="Category"
            initialValue={item.category}
          />
          <InputTextField
            fieldName="company"
            fieldLabel="Company"
            initialValue={item.company}
          />
          <InputTextAreaField
            fieldName="description"
            fieldLabel="Description"
            initialValue={item.description}
          />
        </>
      ),
    },
    {
      key: 'picture',
      label: 'Picture',
      children: <Picture itemId={item._id!} imageUrl={item.imageUrl} />,
    },
    {
      key: 'pricing',
      label: 'Pricing',
      forceRender: true,
      children: (
        <>
          <InputNumberField
            fieldName="defaultUnitPrice"
            fieldLabel="Default Unit Price"
            initialValue={item.defaultUnitPrice}
            minValue={0}
            precision={2}
          />
          <InputNumberField
            fieldName="lastUnitPrice"
            fieldLabel="Last Purchase Price"
            initialValue={item.lastUnitPrice}
            disabled
          />
        </>
      ),
    },
  ];

  return (
    <div className="visitor-form">
      <Form
        layout="horizontal"
        onFinish={handleFinish}
        onFieldsChange={() => setIsFieldsTouched(true)}
      >
        <Collapse
          className="visitor-form-sections"
          defaultActiveKey={SECTION_KEYS}
          items={items}
        />
        <FormButtonsSaveCancel
          fullWidth
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={item} />
    </div>
  );
};

export default EditForm;
