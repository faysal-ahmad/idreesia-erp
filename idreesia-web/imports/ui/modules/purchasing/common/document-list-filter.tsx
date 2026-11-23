import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { FilterOutlined, SyncOutlined } from '@ant-design/icons';
import { Badge, Button, DatePicker, Flex, Form, Input, Popover, Select, Space, Tag, Checkbox } from 'antd';
import type { Dayjs } from 'dayjs';

import { PURCHASING_VENDOR_BY_ID } from '../vendors/gql';
import { formatDate, toDayjs } from './format';
import { statusDisplayName, statusOptions } from './status-tag';
import VendorSelect from './vendor-select';

const { RangePicker } = DatePicker;

export interface DocumentFilterValues {
  search: string;
  status: string;
  vendorId: string;
  fromDate: string;
  toDate: string;
  toggled: boolean;
}

export interface DocumentFilterOptions {
  searchPlaceholder: string;
  statuses?: string[];
  showVendorFilter?: boolean;
  showDateRange?: boolean;
  toggle?: { name: string; label: string };
}

interface DocumentListFilterProps extends DocumentFilterOptions {
  values: DocumentFilterValues;
  onApply: (values: Partial<DocumentFilterValues>) => void;
  onRefresh: () => void;
}

interface FormValues {
  search?: string;
  status?: string;
  vendorId?: string;
  range?: [Dayjs | null, Dayjs | null] | null;
  toggled?: boolean;
}

interface Chip {
  key: string;
  label: string;
  value: string;
  clear: Partial<DocumentFilterValues>;
}

const useChips = (
  { values, statuses, showVendorFilter, showDateRange, toggle }: DocumentFilterOptions & {
    values: DocumentFilterValues;
  }
): Chip[] => {
  const { data } = useQuery(PURCHASING_VENDOR_BY_ID, {
    variables: { _id: values.vendorId },
    skip: !showVendorFilter || !values.vendorId,
  });

  const chips: Chip[] = [];
  if (values.search) {
    chips.push({ key: 'search', label: 'Search', value: values.search, clear: { search: '' } });
  }
  if (statuses && values.status !== 'all') {
    chips.push({
      key: 'status',
      label: 'Status',
      value: statusDisplayName(values.status),
      clear: { status: 'all' },
    });
  }
  if (showVendorFilter && values.vendorId) {
    chips.push({
      key: 'vendorId',
      label: 'Vendor',
      value: data?.purchasingVendorById?.name ?? 'Selected vendor',
      clear: { vendorId: '' },
    });
  }
  if (showDateRange && values.fromDate) {
    chips.push({ key: 'fromDate', label: 'From', value: formatDate(values.fromDate), clear: { fromDate: '' } });
  }
  if (showDateRange && values.toDate) {
    chips.push({ key: 'toDate', label: 'To', value: formatDate(values.toDate), clear: { toDate: '' } });
  }
  if (toggle && values.toggled) {
    chips.push({ key: 'toggle', label: toggle.label, value: 'Yes', clear: { toggled: false } });
  }
  return chips;
};

/** The Filter popover and Reload button, in the style of the Stores lists. */
export const DocumentListFilter = (props: DocumentListFilterProps) => {
  const { values, onApply, onRefresh, searchPlaceholder, statuses, showVendorFilter, showDateRange, toggle } = props;
  const [form] = Form.useForm<FormValues>();
  const [open, setOpen] = useState(false);
  const activeCount = useChips(props).length;

  const syncFormValues = () =>
    form.setFieldsValue({
      search: values.search,
      status: values.status,
      vendorId: values.vendorId || undefined,
      range: [toDayjs(values.fromDate), toDayjs(values.toDate)],
      toggled: values.toggled,
    });

  const handleFinish = (next: FormValues) => {
    onApply({
      search: (next.search ?? '').trim(),
      status: next.status ?? 'all',
      vendorId: next.vendorId ?? '',
      fromDate: next.range?.[0] ? String(next.range[0].startOf('day').valueOf()) : '',
      toDate: next.range?.[1] ? String(next.range[1].endOf('day').valueOf()) : '',
      toggled: !!next.toggled,
    });
    setOpen(false);
  };

  const layout = { labelCol: { span: 6 }, wrapperCol: { span: 18 } };

  const panel = (
    <div className="list-filter-panel" style={{ width: 560, paddingTop: 4, overflow: 'visible' }}>
      <Form form={form} layout="horizontal" style={{ width: '100%' }} onFinish={handleFinish}>
        <Form.Item name="search" label="Search" {...layout}>
          <Input allowClear placeholder={searchPlaceholder} />
        </Form.Item>
        {statuses ? (
          <Form.Item name="status" label="Status" {...layout}>
            <Select options={[{ value: 'all', label: 'All statuses' }, ...statusOptions(statuses)]} />
          </Form.Item>
        ) : null}
        {showVendorFilter ? (
          <Form.Item name="vendorId" label="Vendor" {...layout}>
            <VendorSelect includeInactive placeholder="All vendors" style={{ width: '100%' }} />
          </Form.Item>
        ) : null}
        {showDateRange ? (
          <Form.Item name="range" label="Dates" {...layout}>
            <RangePicker format="DD MMM, YYYY" style={{ width: '100%' }} />
          </Form.Item>
        ) : null}
        {toggle ? (
          <Form.Item name="toggled" valuePropName="checked" label=" " colon={false} {...layout}>
            <Checkbox>{toggle.label}</Checkbox>
          </Form.Item>
        ) : null}
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
        content={panel}
      >
        <Badge count={activeCount} size="small" offset={[-2, 2]}>
          <Button icon={<FilterOutlined />}>Filter</Button>
        </Badge>
      </Popover>
      <Button icon={<SyncOutlined />} onClick={onRefresh} title="Reload Data" />
    </Space>
  );
};

/** One closable chip per active filter, plus "Clear all". */
export const DocumentFilterChips = (
  props: DocumentFilterOptions & {
    values: DocumentFilterValues;
    onApply: (values: Partial<DocumentFilterValues>) => void;
  }
) => {
  const chips = useChips(props);
  if (chips.length === 0) return null;

  const clearAll = chips.reduce<Partial<DocumentFilterValues>>((all, chip) => ({ ...all, ...chip.clear }), {});

  return (
    <Flex wrap="wrap" gap={8} align="center" justify="flex-end" className="list-filter-chips">
      {chips.map((chip) => (
        <Tag
          key={chip.key}
          closable
          onClose={(event) => {
            event.preventDefault();
            props.onApply(chip.clear);
          }}
        >
          <span>
            {chip.label}: {chip.value}
          </span>
        </Tag>
      ))}
      <Button type="link" size="small" onClick={() => props.onApply(clearAll)}>
        Clear all
      </Button>
    </Flex>
  );
};
