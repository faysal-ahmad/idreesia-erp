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

import { useDistinctCities } from 'meteor/idreesia-common/hooks/security';

import {
  InputCnicField,
  InputMobileField,
  InputTextField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';

interface PageParams {
  pageIndex: string;
  name?: string;
  cnicNumber?: string;
  phoneNumber?: string;
  city?: string;
}

export interface PeopleListFilterFormValues {
  name?: string;
  cnicNumber?: string;
  phoneNumber?: string;
  city?: string;
}

export interface PeopleListFilterProps {
  setPageParams(params: PageParams): void;
  refreshData?: () => Promise<unknown>;
  name?: string;
  cnicNumber?: string;
  phoneNumber?: string;
  city?: string;
}

interface FilterChip {
  key: keyof PageParams;
  label: string;
  value: string;
}

const FilterPanelStyle: CSSProperties = {
  width: 480,
  paddingTop: 4,
  overflow: 'visible',
};

const FilterFormStyle: CSSProperties = {
  width: '100%',
};

const formItemLayout = {
  labelCol: { span: 7 },
  wrapperCol: { span: 17 },
};

const hasFilterValue = (value?: string | null) =>
  value != null && String(value).trim() !== '';

export const getPeopleFilterChips = ({
  name,
  cnicNumber,
  phoneNumber,
  city,
}: Pick<
  PeopleListFilterProps,
  'name' | 'cnicNumber' | 'phoneNumber' | 'city'
>): FilterChip[] => {
  const chips: FilterChip[] = [];

  if (hasFilterValue(name)) {
    chips.push({ key: 'name', label: 'Name', value: String(name) });
  }
  if (hasFilterValue(cnicNumber)) {
    chips.push({
      key: 'cnicNumber',
      label: 'CNIC',
      value: String(cnicNumber),
    });
  }
  if (hasFilterValue(phoneNumber)) {
    chips.push({
      key: 'phoneNumber',
      label: 'Phone',
      value: String(phoneNumber),
    });
  }
  if (hasFilterValue(city)) {
    chips.push({ key: 'city', label: 'City', value: String(city) });
  }

  return chips;
};

export const PeopleFilterChips = ({
  setPageParams,
  name,
  cnicNumber,
  phoneNumber,
  city,
}: PeopleListFilterProps) => {
  const chips = useMemo(
    () => getPeopleFilterChips({ name, cnicNumber, phoneNumber, city }),
    [name, cnicNumber, phoneNumber, city]
  );

  if (chips.length === 0) return null;

  const clearChip = (key: FilterChip['key']) => {
    setPageParams({ pageIndex: '0', [key]: '' });
  };

  const clearAll = () => {
    setPageParams({
      pageIndex: '0',
      name: '',
      cnicNumber: '',
      phoneNumber: '',
      city: '',
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
  setPageParams,
  refreshData,
  name = '',
  cnicNumber = '',
  phoneNumber = '',
  city = '',
}: PeopleListFilterProps) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const { distinctCities, distinctCitiesLoading } = useDistinctCities();

  const activeFilterCount = getPeopleFilterChips({
    name,
    cnicNumber,
    phoneNumber,
    city,
  }).length;

  const syncFormValues = () => {
    form.setFieldsValue({ name, cnicNumber, phoneNumber, city });
  };

  const handleFinish = (values: PeopleListFilterFormValues) => {
    setPageParams({
      pageIndex: '0',
      name: values.name,
      cnicNumber: values.cnicNumber,
      phoneNumber: values.phoneNumber,
      city: values.city,
    });
    setOpen(false);
  };

  const handleRefresh = () => {
    if (!refreshData) return;
    refreshData().then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  if (distinctCitiesLoading) return null;

  const filterForm = (
    <div className="list-filter-panel" style={FilterPanelStyle}>
      <Form
        form={form}
        layout="horizontal"
        style={FilterFormStyle}
        onFinish={handleFinish}
      >
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required={false}
          fieldLayout={formItemLayout}
          initialValue={name}
        />
        <InputCnicField
          fieldName="cnicNumber"
          fieldLabel="CNIC Number"
          required={false}
          requiredMessage="Please input a valid CNIC number."
          fieldLayout={formItemLayout}
          initialValue={cnicNumber}
        />
        <InputMobileField
          fieldName="phoneNumber"
          fieldLabel="Phone Number"
          required={false}
          fieldLayout={formItemLayout}
          initialValue={phoneNumber}
        />
        <SelectField
          data={(distinctCities ?? []) as any}
          getDataValue={((cityName: string) => cityName) as any}
          getDataText={((cityName: string) => cityName) as any}
          initialValue={city}
          fieldName="city"
          fieldLabel="City"
          fieldLayout={formItemLayout}
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
