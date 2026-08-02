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
  message,
} from 'antd';
import { FilterOutlined, SyncOutlined } from '@ant-design/icons';

import { Formats } from 'meteor/idreesia-common/constants';
import { StayReasons } from 'meteor/idreesia-common/constants/security';
import { useDistinctCities } from 'meteor/idreesia-common/hooks/security';
import {
  AutoCompleteField,
  InputTextField,
  DateField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';

import type { PageParams } from './list-container';

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

interface FilterValues {
  startDate?: Dayjs | null;
  endDate?: Dayjs | null;
  name?: string;
  city?: string;
  stayReason?: string;
  additionalInfo?: string;
}

interface QueryParams {
  startDate?: string;
  endDate?: string;
  name?: string;
  city?: string;
  stayReason?: string;
  additionalInfo?: string;
}

interface Props {
  setPageParams(params: PageParams): void;
  queryParams?: QueryParams;
  refreshData?: () => Promise<unknown>;
}

type FilterChipKey =
  | 'startDate'
  | 'endDate'
  | 'name'
  | 'city'
  | 'stayReason'
  | 'additionalInfo';

interface FilterChip {
  key: FilterChipKey;
  label: string;
  value: string;
}

const ADDITIONAL_INFO_LABELS: Record<string, string> = {
  'has-notes': 'Has Associated Notes',
  'has-criminal-record': 'Has Criminal Record',
  'has-notes-or-criminal-record': 'Has Notes or Criminal Record',
};

const additionalInfoOptions: LabelValue[] = [
  { label: 'Has Associated Notes', value: 'has-notes' },
  { label: 'Has Criminal Record', value: 'has-criminal-record' },
  { label: 'Has Notes or Criminal Record', value: 'has-notes-or-criminal-record' },
];

const STAY_REASON_LABELS = StayReasons.reduce<Record<string, string>>(
  (acc, reason) => {
    acc[reason._id] = reason.name;
    return acc;
  },
  {}
);

const hasFilterValue = (value?: string | null) =>
  value != null && String(value).trim() !== '';

const getStayReportFilterChips = (queryParams: QueryParams): FilterChip[] => {
  const { startDate, endDate, name, city, stayReason, additionalInfo } =
    queryParams;
  const chips: FilterChip[] = [];

  if (hasFilterValue(startDate)) {
    chips.push({ key: 'startDate', label: 'Start Date', value: String(startDate) });
  }
  if (hasFilterValue(endDate)) {
    chips.push({ key: 'endDate', label: 'End Date', value: String(endDate) });
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
  if (hasFilterValue(additionalInfo)) {
    chips.push({
      key: 'additionalInfo',
      label: 'Additional Info',
      value:
        ADDITIONAL_INFO_LABELS[String(additionalInfo)] ||
        String(additionalInfo),
    });
  }

  return chips;
};

export const StayReportFilterChips = ({
  setPageParams,
  queryParams = {},
}: Props) => {
  const chips = useMemo(
    () => getStayReportFilterChips(queryParams),
    [queryParams]
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
      startDate: null,
      endDate: null,
      name: null,
      city: null,
      stayReason: null,
      additionalInfo: null,
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

const ListFilter = ({
  setPageParams,
  queryParams = {},
  refreshData,
}: Props) => {
  const [form] = Form.useForm<FilterValues>();
  const [open, setOpen] = useState(false);
  const { distinctCities, distinctCitiesLoading } = useDistinctCities();

  const {
    startDate,
    endDate,
    name,
    city,
    stayReason,
    additionalInfo,
  } = queryParams;

  const mStartDate = startDate ? dayjs(startDate, Formats.DATE_FORMAT) : null;
  const mEndDate = endDate ? dayjs(endDate, Formats.DATE_FORMAT) : null;

  const activeFilterCount = getStayReportFilterChips(queryParams).length;

  const syncFormValues = () => {
    form.setFieldsValue({
      startDate: mStartDate,
      endDate: mEndDate,
      name: name || undefined,
      city: city || undefined,
      stayReason: stayReason || undefined,
      additionalInfo: additionalInfo || undefined,
    });
  };

  const handleFinish = ({
    startDate: start,
    endDate: end,
    name: nameVal,
    city: cityVal,
    stayReason: stayReasonVal,
    additionalInfo: additionalInfoVal,
  }: FilterValues) => {
    setPageParams({
      startDate: start ? dayjs(start).format(Formats.DATE_FORMAT) : null,
      endDate: end ? dayjs(end).format(Formats.DATE_FORMAT) : null,
      name: nameVal || null,
      city: cityVal || null,
      stayReason: stayReasonVal || null,
      additionalInfo: additionalInfoVal || null,
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
          fieldName="startDate"
          fieldLabel="Start Date"
          fieldLayout={formItemLayout}
          required={false}
          initialValue={mStartDate}
        />
        <DateField
          fieldName="endDate"
          fieldLabel="End Date"
          fieldLayout={formItemLayout}
          required={false}
          initialValue={mEndDate}
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
          dataSource={distinctCities ?? undefined}
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
        <SelectField<LabelValue>
          fieldName="additionalInfo"
          fieldLabel="Additional Info"
          required={false}
          data={additionalInfoOptions}
          getDataValue={({ value }) => value}
          getDataText={({ label }) => label}
          initialValue={additionalInfo}
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
