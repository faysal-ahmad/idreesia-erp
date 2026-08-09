import React, { useRef, type CSSProperties } from 'react';
import { Button, Collapse, Form, Row } from 'antd';

import type { ItemCategoriesByPhysicalStoreIdQuery } from 'meteor/idreesia-common/types/client-operations';
import {
  InputTextField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';
import { RefreshButton } from '/imports/ui/modules/helpers/controls';
import { usePhysicalStoreItemCategories } from '/imports/ui/modules/stores/common/hooks';

const ContainerStyle: CSSProperties = {
  width: '500px',
};

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 },
};

const buttonItemLayout = {
  wrapperCol: { span: 12, offset: 4 },
};

interface LabelValue {
  label: string;
  value: string;
}

type ItemCategory = NonNullable<
  NonNullable<
    ItemCategoriesByPhysicalStoreIdQuery['itemCategoriesByPhysicalStoreId']
  >[number]
>;

export interface PageParams {
  pageIndex?: number;
  pageSize?: number;
  categoryId?: string | null;
  name?: string | null;
  verifyDuration?: string | null;
  stockLevel?: string | null;
}

interface FilterFormValues {
  categoryId?: string;
  name?: string;
  verifyDuration?: string;
  stockLevel?: string;
}

interface Props {
  name?: string | null;
  categoryId?: string | null;
  verifyDuration?: string | null;
  stockLevel?: string | null;
  physicalStoreId: string;
  setPageParams(params: PageParams): void;
  refreshData?(): Promise<unknown>;
}

const ListFilter = ({
  name,
  categoryId,
  verifyDuration,
  stockLevel,
  physicalStoreId,
  setPageParams,
  refreshData,
}: Props) => {
  const formRef = useRef<any>(null);
  const { itemCategoriesByPhysicalStoreId } =
    usePhysicalStoreItemCategories(physicalStoreId);

  const handleReset = () => {
    formRef.current?.resetFields();
    setPageParams({
      pageIndex: 0,
      categoryId: null,
      name: null,
      verifyDuration: null,
      stockLevel: null,
    });
  };

  const handleFinish = ({
    categoryId: categoryIdVal,
    name: nameVal,
    verifyDuration: verifyDurationVal,
    stockLevel: stockLevelVal,
  }: FilterFormValues) => {
    setPageParams({
      pageIndex: 0,
      categoryId: categoryIdVal,
      name: nameVal,
      verifyDuration: verifyDurationVal,
      stockLevel: stockLevelVal,
    });
  };

  const categories = (itemCategoriesByPhysicalStoreId ?? []).filter(
    (category): category is ItemCategory => category != null
  );

  return (
    <Collapse
      style={ContainerStyle}
      items={[
        {
          key: '1',
          label: 'Filter',
          extra: <RefreshButton refreshData={refreshData} />,
          children: (
            <Form ref={formRef} layout="horizontal" onFinish={handleFinish}>
              <SelectField<ItemCategory>
                data={categories}
                getDataValue={category => category._id ?? ''}
                getDataText={category => category.name ?? ''}
                fieldName="categoryId"
                fieldLabel="Category"
                fieldLayout={formItemLayout}
                initialValue={categoryId}
              />
              <InputTextField
                fieldName="name"
                fieldLabel="Name"
                required={false}
                fieldLayout={formItemLayout}
                initialValue={name}
              />
              <SelectField<LabelValue>
                fieldName="stockLevel"
                fieldLabel="Stock Level"
                required={false}
                data={[
                  {
                    label: 'Negative Stock Level',
                    value: 'negative-stock-level',
                  },
                  {
                    label: 'Less than Min Stock Level',
                    value: 'less-than-min-stock-level',
                  },
                ]}
                getDataValue={({ value }) => value}
                getDataText={({ label }) => label}
                fieldLayout={formItemLayout}
                initialValue={stockLevel}
              />
              <SelectField<LabelValue>
                fieldName="verifyDuration"
                fieldLabel="Stock Verified"
                required={false}
                data={[
                  {
                    label: 'Less than 3 months ago',
                    value: 'less-than-3-months-ago',
                  },
                  {
                    label: 'Between 3 to 6 months ago',
                    value: 'between-3-to-6-months-ago',
                  },
                  {
                    label: 'More than 6 months ago',
                    value: 'more-than-6-months-ago',
                  },
                ]}
                getDataValue={({ value }) => value}
                getDataText={({ label }) => label}
                fieldLayout={formItemLayout}
                initialValue={verifyDuration}
              />
              <Form.Item {...buttonItemLayout}>
                <Row justify="end">
                  <Button type="default" onClick={handleReset}>
                    Reset
                  </Button>
                  &nbsp;
                  <Button type="primary" htmlType="submit">
                    Search
                  </Button>
                </Row>
              </Form.Item>
            </Form>
          ),
        },
      ]}
    />
  );
};

export default ListFilter;
