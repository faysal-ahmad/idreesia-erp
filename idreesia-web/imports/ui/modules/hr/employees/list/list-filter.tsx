import React, { useMemo, useState, type CSSProperties } from 'react';
import {
  Badge,
  Button,
  Flex,
  Form,
  Popover,
  Space,
  Spin,
  Tag,
} from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { FilterOutlined, SyncOutlined } from '@ant-design/icons';

import type { AllJobsQuery } from 'meteor/idreesia-common/types/client-operations';
import {
  InputCnicField,
  InputTextField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';
import { useAllJobs } from '/imports/ui/modules/hr/common/hooks';

interface LabelValue {
  label: string;
  value: string;
}

export interface PageParams {
  pageIndex?: number | string;
  pageSize?: number | string;
  name?: string | null;
  cnicNumber?: string | null;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  jobId?: string | null;
}

interface FilterFormValues {
  name?: string;
  cnicNumber?: string;
  phoneNumber?: string;
  bloodGroup?: string;
  jobId?: string;
}

export interface EmployeesListFilterProps {
  setPageParams(params: PageParams): void;
  refreshData?: () => Promise<unknown>;
  name?: string | null;
  cnicNumber?: string | null;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  jobId?: string | null;
}

type Job = NonNullable<NonNullable<AllJobsQuery['allJobs']>[number]>;

type FilterChipKey =
  | 'name'
  | 'cnicNumber'
  | 'phoneNumber'
  | 'bloodGroup'
  | 'jobId';

interface FilterChip {
  key: FilterChipKey;
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

const BLOOD_GROUP_OPTIONS: LabelValue[] = [
  { label: 'A-', value: 'A-' },
  { label: 'A+', value: 'Aplus' },
  { label: 'B-', value: 'B-' },
  { label: 'B+', value: 'Bplus' },
  { label: 'AB-', value: 'AB-' },
  { label: 'AB+', value: 'ABplus' },
  { label: 'O-', value: 'O-' },
  { label: 'O+', value: 'Oplus' },
];

const BLOOD_GROUP_LABELS = Object.fromEntries(
  BLOOD_GROUP_OPTIONS.map(({ value, label }) => [value, label])
) as Record<string, string>;

const hasFilterValue = (value?: string | null) =>
  value != null && String(value).trim() !== '';

export const getEmployeesFilterChips = ({
  name,
  cnicNumber,
  phoneNumber,
  bloodGroup,
  jobId,
  jobLabel,
}: Pick<
  EmployeesListFilterProps,
  'name' | 'cnicNumber' | 'phoneNumber' | 'bloodGroup' | 'jobId'
> & {
  jobLabel?: string;
}): FilterChip[] => {
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
  if (hasFilterValue(bloodGroup)) {
    chips.push({
      key: 'bloodGroup',
      label: 'Blood Group',
      value: BLOOD_GROUP_LABELS[String(bloodGroup)] || String(bloodGroup),
    });
  }

  if (hasFilterValue(jobId)) {
    chips.push({
      key: 'jobId',
      label: 'Job',
      value: jobLabel || String(jobId),
    });
  }

  return chips;
};

export const EmployeesFilterChips = ({
  setPageParams,
  name,
  cnicNumber,
  phoneNumber,
  bloodGroup,
  jobId,
}: EmployeesListFilterProps) => {
  const { allJobs } = useAllJobs();

  const jobLabel = useMemo(() => {
    if (!hasFilterValue(jobId)) return undefined;
    return (allJobs ?? []).find(job => job?._id === jobId)?.name ?? undefined;
  }, [allJobs, jobId]);

  const chips = useMemo(
    () =>
      getEmployeesFilterChips({
        name,
        cnicNumber,
        phoneNumber,
        bloodGroup,
        jobId,
        jobLabel,
      }),
    [name, cnicNumber, phoneNumber, bloodGroup, jobId, jobLabel]
  );

  if (chips.length === 0) return null;

  const clearChip = (key: FilterChipKey) => {
    setPageParams({
      pageIndex: 0,
      [key]: '',
    });
  };

  const clearAll = () => {
    setPageParams({
      pageIndex: 0,
      name: '',
      cnicNumber: '',
      phoneNumber: '',
      bloodGroup: '',
      jobId: '',
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
  cnicNumber = '',
  phoneNumber,
  bloodGroup,
  jobId,
}: EmployeesListFilterProps) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const { allJobs, allJobsLoading } = useAllJobs();

  const activeFilterCount = getEmployeesFilterChips({
    name,
    cnicNumber,
    phoneNumber,
    bloodGroup,
    jobId,
  }).length;

  const syncFormValues = () => {
    form.setFieldsValue({
      name,
      cnicNumber,
      phoneNumber,
      bloodGroup,
      jobId,
    });
  };

  const handleFinish = (values: FilterFormValues) => {
    setPageParams({
      pageIndex: 0,
      name: values.name,
      cnicNumber: values.cnicNumber,
      phoneNumber: values.phoneNumber,
      bloodGroup: values.bloodGroup,
      jobId: values.jobId,
    });
    setOpen(false);
  };

  const handleRefresh = () => {
    if (!refreshData) return;
    refreshData().then(() => {
      message.success('Data Reloaded', 2);
    });
  };

  const jobs = (allJobs ?? []).filter((job): job is Job => job != null);

  const filterForm = (
    <div className="list-filter-panel" style={FilterPanelStyle}>
      {allJobsLoading ? (
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <Spin />
        </div>
      ) : (
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
          <InputTextField
            fieldName="phoneNumber"
            fieldLabel="Phone Number"
            required={false}
            fieldLayout={formItemLayout}
            initialValue={phoneNumber}
          />
          <SelectField<LabelValue>
            fieldName="bloodGroup"
            fieldLabel="Blood Group"
            required={false}
            data={BLOOD_GROUP_OPTIONS}
            getDataValue={({ value }) => value}
            getDataText={({ label }) => label}
            fieldLayout={formItemLayout}
            initialValue={bloodGroup}
          />
          <SelectField<Job>
            fieldName="jobId"
            fieldLabel="Job"
            required={false}
            data={jobs}
            getDataValue={({ _id }) => _id ?? ''}
            getDataText={({ name: jobName }) => jobName ?? ''}
            fieldLayout={formItemLayout}
            initialValue={jobId}
          />
          <Form.Item style={{ marginBottom: 0 }}>
            <Flex justify="flex-end">
              <Button type="primary" htmlType="submit">
                Search
              </Button>
            </Flex>
          </Form.Item>
        </Form>
      )}
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
