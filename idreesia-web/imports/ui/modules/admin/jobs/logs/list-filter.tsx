import React, { useMemo, useState, type CSSProperties } from 'react';
import { Badge, Button, Flex, Form, Popover, Space, Tag } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { FilterOutlined, SyncOutlined } from '@ant-design/icons';

import { InputTextField, SelectField } from '/imports/ui/modules/helpers/fields';

interface PageParams {
  pageIndex: string | number;
  jobName?: string;
  level?: string;
  event?: string;
}

export interface JobLogsListFilterFormValues {
  jobName?: string;
  level?: string;
  event?: string;
}

export interface JobLogsListFilterProps {
  setPageParams(params: PageParams): void;
  refreshData?: () => Promise<unknown>;
  jobName?: string;
  level?: string;
  event?: string;
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

const LevelOptions: LabelValue[] = [
  { value: 'info', label: 'Info' },
  { value: 'warn', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'debug', label: 'Debug' },
];

const EventOptions: LabelValue[] = [
  { value: 'start', label: 'Start' },
  { value: 'success', label: 'Success' },
  { value: 'fail', label: 'Fail' },
  { value: 'complete', label: 'Complete' },
  { value: 'retry', label: 'Retry' },
  { value: 'retry:exhausted', label: 'Retry Exhausted' },
  { value: 'locked', label: 'Locked' },
  { value: 'expired', label: 'Expired' },
];

const LEVEL_LABELS: Record<string, string> = LevelOptions.reduce(
  (labels, option) => ({ ...labels, [option.value]: option.label }),
  {}
);

const EVENT_LABELS: Record<string, string> = EventOptions.reduce(
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

export const getJobLogsFilterChips = ({
  jobName,
  level,
  event,
}: Pick<JobLogsListFilterProps, 'jobName' | 'level' | 'event'>): FilterChip[] => {
  const chips: FilterChip[] = [];

  if (hasFilterValue(jobName)) {
    chips.push({ key: 'jobName', label: 'Job Name', value: String(jobName) });
  }
  if (hasFilterValue(level)) {
    chips.push({
      key: 'level',
      label: 'Level',
      value: LEVEL_LABELS[String(level)] || String(level),
    });
  }
  if (hasFilterValue(event)) {
    chips.push({
      key: 'event',
      label: 'Event',
      value: EVENT_LABELS[String(event)] || String(event),
    });
  }

  return chips;
};

export const JobLogsFilterChips = ({
  setPageParams,
  jobName,
  level,
  event,
}: JobLogsListFilterProps) => {
  const chips = useMemo(
    () => getJobLogsFilterChips({ jobName, level, event }),
    [jobName, level, event]
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
      jobName: '',
      level: '',
      event: '',
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
          onClose={ev => {
            ev.preventDefault();
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
  jobName,
  level,
  event,
}: JobLogsListFilterProps) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  const activeFilterCount = getJobLogsFilterChips({ jobName, level, event }).length;

  const syncFormValues = () => {
    form.setFieldsValue({ jobName, level, event });
  };

  const handleFinish = (values: JobLogsListFilterFormValues) => {
    setPageParams({
      pageIndex: 0,
      jobName: values.jobName,
      level: values.level,
      event: values.event,
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
          fieldName="jobName"
          fieldLabel="Job Name"
          required={false}
          fieldLayout={formItemLayout}
          initialValue={jobName}
        />
        <SelectField
          fieldName="level"
          fieldLabel="Level"
          required={false}
          data={LevelOptions}
          getDataValue={({ value }: LabelValue) => value}
          getDataText={({ label }: LabelValue) => label}
          initialValue={level}
          fieldLayout={formItemLayout}
        />
        <SelectField
          fieldName="event"
          fieldLabel="Event"
          required={false}
          data={EventOptions}
          getDataValue={({ value }: LabelValue) => value}
          getDataText={({ label }: LabelValue) => label}
          initialValue={event}
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
