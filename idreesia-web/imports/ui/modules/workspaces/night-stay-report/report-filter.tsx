import React, { useMemo, useState, type CSSProperties } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { Badge, Button, Flex, Form, Popover, Space, Tag } from 'antd';
import { FilterOutlined, SyncOutlined } from '@ant-design/icons';

import { Formats } from 'meteor/idreesia-common/constants';
import { StayReasons } from 'meteor/idreesia-common/constants/security';
import { useDistinctCities } from 'meteor/idreesia-common/hooks/security';
import { message } from '/imports/ui/antd-feedback';
import {
  AutoCompleteField,
  DateField,
  InputTextField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';

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

export interface FilterParams {
  stayDate?: string | null;
  name?: string | null;
  city?: string | null;
  stayReason?: string | null;
  pageIndex?: number;
}

export interface FilterQueryParams {
  stayDate?: string;
  name?: string;
  city?: string;
  stayReason?: string;
}

interface FilterValues {
  stayDate?: Dayjs | null;
  name?: string;
  city?: string;
  stayReason?: string;
}

interface Props {
  queryParams: FilterQueryParams;
  // Tonight's date (DD-MM-YYYY). The report falls back to it when no stay
  // date is set, so it isn't shown as an active filter.
  defaultStayDate: string;
  setPageParams(params: FilterParams): void;
  refreshData?: () => Promise<unknown>;
}

type FilterChipKey = 'stayDate' | 'name' | 'city' | 'stayReason';

interface FilterChip {
  key: FilterChipKey;
  label: string;
  value: string;
}

const STAY_REASON_LABELS = StayReasons.reduce<Record<string, string>>(
  (acc, reason) => {
    acc[reason._id] = reason.name;
    return acc;
  },
  {}
);

const hasFilterValue = (value?: string | null) =>
  value != null && String(value).trim() !== '';

const getFilterChips = (
  queryParams: FilterQueryParams,
  defaultStayDate: string
): FilterChip[] => {
  const { stayDate, name, city, stayReason } = queryParams;
  const chips: FilterChip[] = [];

  if (hasFilterValue(stayDate) && stayDate !== defaultStayDate) {
    chips.push({ key: 'stayDate', label: 'Stay Date', value: String(stayDate) });
  }
  if (hasFilterValue(name)) {
    chips.push({ key: 'name', label: 'Name', value: String(name) });
  }
  if (hasFilterValue(city)) {
    chips.push({ key: 'city', label: 'City', value: String(city) });
  }
  if (hasFilterValue(stayReason)) {
    chips.push({
      key: 'stayReason',
      label: 'Stay Reason',
      value: STAY_REASON_LABELS[String(stayReason)] || String(stayReason),
    });
  }

  return chips;
};

export const ReportFilterChips = ({
  queryParams,
  defaultStayDate,
  setPageParams,
}: Props) => {
  const chips = useMemo(
    () => getFilterChips(queryParams, defaultStayDate),
    [queryParams, defaultStayDate]
  );

  if (chips.length === 0) return null;

  const clearChip = (key: FilterChipKey) => {
    setPageParams({ pageIndex: 0, [key]: null });
  };

  const clearAll = () => {
    setPageParams({
      stayDate: null,
      name: null,
      city: null,
      stayReason: null,
      pageIndex: 0,
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

const ReportFilter = ({
  queryParams,
  defaultStayDate,
  setPageParams,
  refreshData,
}: Props) => {
  const [form] = Form.useForm<FilterValues>();
  const [open, setOpen] = useState(false);
  const { distinctCities, distinctCitiesLoading } = useDistinctCities();

  const { stayDate, name, city, stayReason } = queryParams;
  const mStayDate = stayDate ? dayjs(stayDate, Formats.DATE_FORMAT) : null;
  const activeFilterCount = getFilterChips(queryParams, defaultStayDate).length;

  const syncFormValues = () => {
    form.setFieldsValue({
      stayDate: mStayDate,
      name: name || undefined,
      city: city || undefined,
      stayReason: stayReason || undefined,
    });
  };

  const handleFinish = ({
    stayDate: stayDateVal,
    name: nameVal,
    city: cityVal,
    stayReason: stayReasonVal,
  }: FilterValues) => {
    setPageParams({
      stayDate: stayDateVal
        ? dayjs(stayDateVal).format(Formats.DATE_FORMAT)
        : null,
      name: nameVal || null,
      city: cityVal || null,
      stayReason: stayReasonVal || null,
      pageIndex: 0,
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
        <DateField
          fieldName="stayDate"
          fieldLabel="Stay Date"
          fieldLayout={formItemLayout}
          required={false}
          initialValue={mStayDate}
        />
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required={false}
          fieldLayout={formItemLayout}
          initialValue={name}
        />
        <AutoCompleteField
          fieldName="city"
          fieldLabel="City"
          fieldLayout={formItemLayout}
          options={distinctCities ?? undefined}
          initialValue={city}
          required={false}
        />
        <SelectField
          data={StayReasons}
          getDataValue={({ _id }) => _id}
          getDataText={({ name: reasonName }) => reasonName}
          initialValue={stayReason}
          fieldName="stayReason"
          fieldLabel="Stay Reason"
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
      <Button
        icon={<SyncOutlined />}
        onClick={handleRefresh}
        title="Reload Data"
      />
    </Space>
  );
};

export default ReportFilter;
