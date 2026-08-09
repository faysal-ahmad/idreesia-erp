import React, { useMemo, useState, type CSSProperties } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
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

import { Formats } from 'meteor/idreesia-common/constants';
import { DataSource } from 'meteor/idreesia-common/constants';

import {
  DateRangeField,
  InputCnicField,
  InputMobileField,
  InputTextField,
  SelectField,
  EhadDurationFilterField,
} from '/imports/ui/modules/helpers/fields';

interface PageParams {
  pageIndex: string | number;
  name?: string;
  cnicNumber?: string;
  phoneNumber?: string;
  city?: string;
  ehadDuration?: string;
  additionalInfo?: string;
  dataSource?: string;
  updatedBetween?: string;
}

export interface VisitorListFilterFormValues {
  name?: string;
  cnicNumber?: string;
  phoneNumber?: string;
  city?: string;
  ehadDuration?: string;
  additionalInfo?: string;
  dataSource?: string;
  updatedBetween?: [Dayjs | null, Dayjs | null];
}

export interface VisitorListFilterProps {
  setPageParams(params: PageParams): void;
  refreshData?: () => Promise<unknown>;
  name?: string;
  cnicNumber?: string;
  phoneNumber?: string;
  city?: string;
  ehadDuration?: string | null;
  additionalInfo?: string | null;
  dataSource?: string;
  updatedBetween?: string;
  showAdditionalInfoFilter?: boolean;
  showDataSourceFilter?: boolean;
  distinctCities?: string[];
}

interface LabelValue {
  label: string;
  value: string;
}

interface FilterChip {
  key: keyof PageParams;
  label: string;
  value: string;
}

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

const ADDITIONAL_INFO_LABELS: Record<string, string> = {
  'has-notes': 'Has Associated Notes',
  'has-criminal-record': 'Has Criminal Record',
  'has-notes-or-criminal-record': 'Has Notes or Criminal Record',
};

const DATA_SOURCE_LABELS: Record<string, string> = {
  [DataSource.SECURITY]: 'Security',
  [DataSource.OUTSTATION]: 'Outstation',
  [DataSource.OPERATIONS]: 'Operations',
  [DataSource.PORTAL]: 'Portals',
};

const hasFilterValue = (value?: string | null) =>
  value != null && String(value).trim() !== '';

const parseUpdatedBetween = (updatedBetween?: string) => {
  if (!updatedBetween) return ['', ''] as [string, string];
  try {
    const dates = JSON.parse(updatedBetween);
    return [dates?.[0] || '', dates?.[1] || ''] as [string, string];
  } catch {
    return ['', ''] as [string, string];
  }
};

export const getVisitorFilterChips = ({
  name,
  cnicNumber,
  phoneNumber,
  city,
  ehadDuration,
  additionalInfo,
  dataSource,
  updatedBetween,
}: Pick<
  VisitorListFilterProps,
  | 'name'
  | 'cnicNumber'
  | 'phoneNumber'
  | 'city'
  | 'ehadDuration'
  | 'additionalInfo'
  | 'dataSource'
  | 'updatedBetween'
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
  if (hasFilterValue(ehadDuration)) {
    chips.push({
      key: 'ehadDuration',
      label: 'Ehad Duration',
      value: String(ehadDuration),
    });
  }
  if (hasFilterValue(additionalInfo)) {
    chips.push({
      key: 'additionalInfo',
      label: 'Additional Info',
      value:
        ADDITIONAL_INFO_LABELS[String(additionalInfo)] ||
        String(additionalInfo),
    });
  }
  if (hasFilterValue(dataSource)) {
    chips.push({
      key: 'dataSource',
      label: 'Data Source',
      value: DATA_SOURCE_LABELS[String(dataSource)] || String(dataSource),
    });
  }

  const [startDate, endDate] = parseUpdatedBetween(updatedBetween);
  if (startDate || endDate) {
    chips.push({
      key: 'updatedBetween',
      label: 'Updated',
      value: `${startDate || '…'} – ${endDate || '…'}`,
    });
  }

  return chips;
};

export const VisitorFilterChips = ({
  setPageParams,
  name,
  cnicNumber,
  phoneNumber,
  city,
  ehadDuration,
  additionalInfo,
  dataSource,
  updatedBetween,
}: VisitorListFilterProps) => {
  const chips = useMemo(
    () =>
      getVisitorFilterChips({
        name,
        cnicNumber,
        phoneNumber,
        city,
        ehadDuration,
        additionalInfo,
        dataSource,
        updatedBetween,
      }),
    [
      name,
      cnicNumber,
      phoneNumber,
      city,
      ehadDuration,
      additionalInfo,
      dataSource,
      updatedBetween,
    ]
  );

  if (chips.length === 0) return null;

  const clearChip = (key: FilterChip['key']) => {
    if (key === 'updatedBetween') {
      setPageParams({
        pageIndex: '0',
        updatedBetween: JSON.stringify(['', '']),
      });
      return;
    }

    setPageParams({
      pageIndex: '0',
      [key]: '',
    });
  };

  const clearAll = () => {
    setPageParams({
      pageIndex: '0',
      name: '',
      cnicNumber: '',
      phoneNumber: '',
      city: '',
      ehadDuration: '',
      additionalInfo: '',
      dataSource: '',
      updatedBetween: JSON.stringify(['', '']),
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
  name,
  cnicNumber = '',
  phoneNumber = '',
  city = '',
  ehadDuration = null,
  additionalInfo = null,
  dataSource,
  updatedBetween,
  showAdditionalInfoFilter = false,
  showDataSourceFilter = false,
  distinctCities = [],
}: VisitorListFilterProps) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  const [updatedStart, updatedEnd] = parseUpdatedBetween(updatedBetween);
  const updatedBetweenInitialValue = [
    updatedStart ? dayjs(updatedStart, Formats.DATE_FORMAT) : null,
    updatedEnd ? dayjs(updatedEnd, Formats.DATE_FORMAT) : null,
  ] as [Dayjs | null, Dayjs | null];

  const activeFilterCount = getVisitorFilterChips({
    name,
    cnicNumber,
    phoneNumber,
    city,
    ehadDuration,
    additionalInfo,
    dataSource,
    updatedBetween,
  }).length;

  const syncFormValues = () => {
    form.setFieldsValue({
      name,
      cnicNumber,
      phoneNumber,
      city,
      ehadDuration,
      additionalInfo,
      dataSource,
      updatedBetween: updatedBetweenInitialValue,
    });
  };

  const handleFinish = (values: VisitorListFilterFormValues) => {
    setPageParams({
      pageIndex: 0,
      name: values.name,
      cnicNumber: values.cnicNumber,
      phoneNumber: values.phoneNumber,
      city: values.city,
      ehadDuration: values.ehadDuration,
      additionalInfo: values.additionalInfo,
      dataSource: values.dataSource,
      updatedBetween: JSON.stringify([
        values.updatedBetween?.[0]
          ? values.updatedBetween?.[0].format(Formats.DATE_FORMAT)
          : '',
        values.updatedBetween?.[1]
          ? values.updatedBetween?.[1].format(Formats.DATE_FORMAT)
          : '',
      ]),
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
          data={distinctCities as any}
          getDataValue={((cityName: string) => cityName) as any}
          getDataText={((cityName: string) => cityName) as any}
          initialValue={city}
          fieldName="city"
          fieldLabel="City"
          fieldLayout={formItemLayout}
        />
        <EhadDurationFilterField
          fieldName="ehadDuration"
          fieldLabel="Ehad Duration"
          required={false}
          fieldLayout={formItemLayout}
          initialValue={ehadDuration}
        />
        {showAdditionalInfoFilter ? (
          <SelectField
            fieldName="additionalInfo"
            fieldLabel="Additional Info"
            required={false}
            data={[
              {
                label: 'Has Associated Notes',
                value: 'has-notes',
              },
              {
                label: 'Has Crimial Record',
                value: 'has-criminal-record',
              },
              {
                label: 'Has Notes or Crimial Record',
                value: 'has-notes-or-criminal-record',
              },
            ]}
            getDataValue={({ value }: LabelValue) => value}
            getDataText={({ label }: LabelValue) => label}
            initialValue={additionalInfo}
            fieldLayout={formItemLayout}
          />
        ) : null}
        {showDataSourceFilter ? (
          <SelectField
            fieldName="dataSource"
            fieldLabel="Data Source"
            required={false}
            data={[
              {
                label: 'Security',
                value: DataSource.SECURITY,
              },
              {
                label: 'Outstation',
                value: DataSource.OUTSTATION,
              },
              {
                label: 'Operations',
                value: DataSource.OPERATIONS,
              },
              {
                label: 'Portals',
                value: DataSource.PORTAL,
              },
            ]}
            getDataValue={({ value }: LabelValue) => value}
            getDataText={({ label }: LabelValue) => label}
            initialValue={dataSource}
            fieldLayout={formItemLayout}
          />
        ) : null}
        <DateRangeField
          fieldName="updatedBetween"
          fieldLabel="Updated"
          required={false}
          fieldLayout={formItemLayout}
          initialValue={updatedBetweenInitialValue}
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
