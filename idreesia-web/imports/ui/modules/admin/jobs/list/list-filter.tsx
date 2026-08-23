import React, { useMemo, useState, type CSSProperties } from 'react';
import { Badge, Button, Flex, Form, Popover, Space, Tag } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { FilterOutlined, SyncOutlined } from '@ant-design/icons';

import { InputTextField, SelectField } from '/imports/ui/modules/helpers/fields';

interface PageParams {
  pageIndex: string | number;
  name?: string;
  status?: string;
}

export interface JobsListFilterFormValues {
  name?: string;
  status?: string;
}

export interface JobsListFilterProps {
  setPageParams(params: PageParams): void;
  refreshData?: () => Promise<unknown>;
  name?: string;
  status?: string;
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

const StatusOptions: LabelValue[] = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'running', label: 'Running' },
  { value: 'queued', label: 'Queued' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'repeating', label: 'Repeating' },
  { value: 'paused', label: 'Paused' },
];

const STATUS_LABELS: Record<string, string> = StatusOptions.reduce(
  (labels, option) => ({ ...labels, [option.value]: option.label }),
  {}
);

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

const hasFilterValue = (value?: string | null) =>
  value != null && String(value).trim() !== '';

export const getJobsFilterChips = ({
  name,
  status,
}: Pick<JobsListFilterProps, 'name' | 'status'>): FilterChip[] => {
  const chips: FilterChip[] = [];

  if (hasFilterValue(name)) {
    chips.push({ key: 'name', label: 'Job Name', value: String(name) });
  }
  if (hasFilterValue(status)) {
    chips.push({
      key: 'status',
      label: 'Status',
      value: STATUS_LABELS[String(status)] || String(status),
    });
  }

  return chips;
};

export const JobsFilterChips = ({
  setPageParams,
  name,
  status,
}: JobsListFilterProps) => {
  const chips = useMemo(
    () => getJobsFilterChips({ name, status }),
    [name, status]
  );

  if (chips.length === 0) return null;

  const clearChip = (key: FilterChip['key']) => {
    setPageParams({
      pageIndex: '0',
      [key]: '',
    });
  };

  const clearAll = () => {
    setPageParams({
      pageIndex: '0',
      name: '',
      status: '',
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
      {chips.map(chip => (
        <Tag
          key={chip.key}
          closable
          onClose={event => {
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
  status,
}: JobsListFilterProps) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  const activeFilterCount = getJobsFilterChips({ name, status }).length;

  const syncFormValues = () => {
    form.setFieldsValue({ name, status });
  };

  const handleFinish = (values: JobsListFilterFormValues) => {
    setPageParams({
      pageIndex: 0,
      name: values.name,
      status: values.status,
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
          fieldLabel="Job Name"
          required={false}
          fieldLayout={formItemLayout}
          initialValue={name}
        />
        <SelectField
          fieldName="status"
          fieldLabel="Status"
          required={false}
          data={StatusOptions}
          getDataValue={({ value }: LabelValue) => value}
          getDataText={({ label }: LabelValue) => label}
          initialValue={status}
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
        onOpenChange={nextOpen => {
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
        <Button icon={<SyncOutlined />} onClick={handleRefresh} title="Reload Data" />
      ) : null}
    </Space>
  );
};

export default ListFilter;
