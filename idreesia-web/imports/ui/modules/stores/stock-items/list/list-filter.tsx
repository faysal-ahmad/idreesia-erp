import React, { useMemo, useState, type CSSProperties } from 'react';
import {
  Badge,
  Button,
  Flex,
  Form,
  Popover,
  Space,
  Tag,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { FilterOutlined, SyncOutlined } from '@ant-design/icons';

import type { ItemCategoriesByPhysicalStoreIdQuery } from 'meteor/idreesia-common/types/client-operations';
import {
  InputTextField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';
import { usePhysicalStoreItemCategories } from '/imports/ui/modules/stores/common/hooks';

const FilterPanelStyle: CSSProperties = {
  width: 640,
  paddingTop: 4,
  overflow: 'visible',
};

const FilterFormStyle: CSSProperties = {
  width: '100%',
};

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
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

type FilterChipKey =
  | 'categoryId'
  | 'name'
  | 'stockLevel'
  | 'verifyDuration';

interface FilterChip {
  key: FilterChipKey;
  label: string;
  value: string;
}

const STOCK_LEVEL_OPTIONS: LabelValue[] = [
  {
    label: 'Negative Stock Level',
    value: 'negative-stock-level',
  },
  {
    label: 'Less than Min Stock Level',
    value: 'less-than-min-stock-level',
  },
];

const VERIFY_DURATION_OPTIONS: LabelValue[] = [
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
];

const STOCK_LEVEL_LABELS = STOCK_LEVEL_OPTIONS.reduce<Record<string, string>>(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {}
);

const VERIFY_DURATION_LABELS = VERIFY_DURATION_OPTIONS.reduce<
  Record<string, string>
>((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

const hasFilterValue = (value?: string | null) =>
  value != null && String(value).trim() !== '';

const getStockItemsFilterChips = (
  props: Pick<
    Props,
    'name' | 'categoryId' | 'verifyDuration' | 'stockLevel'
  >,
  categories: ItemCategory[] = []
): FilterChip[] => {
  const chips: FilterChip[] = [];
  const { name, categoryId, verifyDuration, stockLevel } = props;

  if (hasFilterValue(categoryId)) {
    const category = categories.find((item) => item._id === categoryId);
    chips.push({
      key: 'categoryId',
      label: 'Category',
      value: category?.name || String(categoryId),
    });
  }
  if (hasFilterValue(name)) {
    chips.push({ key: 'name', label: 'Name', value: String(name) });
  }
  if (hasFilterValue(stockLevel)) {
    chips.push({
      key: 'stockLevel',
      label: 'Stock Level',
      value: STOCK_LEVEL_LABELS[String(stockLevel)] || String(stockLevel),
    });
  }
  if (hasFilterValue(verifyDuration)) {
    chips.push({
      key: 'verifyDuration',
      label: 'Stock Verified',
      value:
        VERIFY_DURATION_LABELS[String(verifyDuration)] ||
        String(verifyDuration),
    });
  }

  return chips;
};

export const StockItemsFilterChips = ({
  name,
  categoryId,
  verifyDuration,
  stockLevel,
  physicalStoreId,
  setPageParams,
}: Props) => {
  const { itemCategoriesByPhysicalStoreId } =
    usePhysicalStoreItemCategories(physicalStoreId);
  const categories = (itemCategoriesByPhysicalStoreId ?? []).filter(
    (category): category is ItemCategory => category != null
  );

  const chips = useMemo(
    () =>
      getStockItemsFilterChips(
        { name, categoryId, verifyDuration, stockLevel },
        categories
      ),
    [name, categoryId, verifyDuration, stockLevel, categories]
  );

  if (chips.length === 0) return null;

  const clearChip = (key: FilterChipKey) => {
    setPageParams({
      pageIndex: 0,
      [key]: null,
    });
  };

  const clearAll = () => {
    setPageParams({
      pageIndex: 0,
      categoryId: null,
      name: null,
      verifyDuration: null,
      stockLevel: null,
    });
  };

  return (
    <Flex
      wrap="wrap"
      gap={8}
      align="center"
      justify="flex-end"
      className="list-filter-chips"
    >
      {chips.map((chip) => (
        <Tag
          key={chip.key}
          closable
          onClose={(event) => {
            event.preventDefault();
            clearChip(chip.key);
          }}
        >
          <span>
            {chip.label}: {chip.value}
          </span>
        </Tag>
      ))}
      <Button type="link" size="small" onClick={clearAll}>
        Clear all
      </Button>
    </Flex>
  );
};

const ListFilter = ({
  name,
  categoryId,
  verifyDuration,
  stockLevel,
  physicalStoreId,
  setPageParams,
  refreshData,
}: Props) => {
  const [form] = Form.useForm<FilterFormValues>();
  const [open, setOpen] = useState(false);
  const { itemCategoriesByPhysicalStoreId } =
    usePhysicalStoreItemCategories(physicalStoreId);

  const categories = (itemCategoriesByPhysicalStoreId ?? []).filter(
    (category): category is ItemCategory => category != null
  );

  const activeFilterCount = getStockItemsFilterChips(
    { name, categoryId, verifyDuration, stockLevel },
    categories
  ).length;

  const syncFormValues = () => {
    form.setFieldsValue({
      categoryId: categoryId || undefined,
      name: name || undefined,
      verifyDuration: verifyDuration || undefined,
      stockLevel: stockLevel || undefined,
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
      categoryId: categoryIdVal || null,
      name: nameVal || null,
      verifyDuration: verifyDurationVal || null,
      stockLevel: stockLevelVal || null,
    });
    setOpen(false);
  };

  const handleRefresh = () => {
    if (!refreshData) return;
    refreshData().then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  const filterForm = (
    <div className="list-filter-panel" style={FilterPanelStyle}>
      <Form
        form={form}
        layout="horizontal"
        style={FilterFormStyle}
        onFinish={handleFinish}
      >
        <SelectField<ItemCategory>
          data={categories}
          getDataValue={(category) => category._id ?? ''}
          getDataText={(category) => category.name ?? ''}
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
          data={STOCK_LEVEL_OPTIONS}
          getDataValue={({ value }) => value}
          getDataText={({ label }) => label}
          fieldLayout={formItemLayout}
          initialValue={stockLevel}
        />
        <SelectField<LabelValue>
          fieldName="verifyDuration"
          fieldLabel="Stock Verified"
          required={false}
          data={VERIFY_DURATION_OPTIONS}
          getDataValue={({ value }) => value}
          getDataText={({ label }) => label}
          fieldLayout={formItemLayout}
          initialValue={verifyDuration}
        />
        <Form.Item style={{ marginBottom: 0 }}>
          <Flex justify="flex-end">
            <Button type="primary" htmlType="submit">
              Search
            </Button>
          </Flex>
        </Form.Item>
      </Form>
    </div>
  );

  return (
    <Space size={8}>
      <Popover
        trigger="click"
        placement="bottomRight"
        open={open}
        onOpenChange={(nextOpen) => {
          if (nextOpen) syncFormValues();
          setOpen(nextOpen);
        }}
        content={filterForm}
      >
        <Badge count={activeFilterCount} size="small" offset={[-2, 2]}>
          <Button icon={<FilterOutlined />}>Filter</Button>
        </Badge>
      </Popover>
      {refreshData ? (
        <Button
          icon={<SyncOutlined />}
          onClick={handleRefresh}
          title="Reload Data"
        />
      ) : null}
    </Space>
  );
};

export default ListFilter;
