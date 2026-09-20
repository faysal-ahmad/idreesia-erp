import React, { useMemo, useState, type CSSProperties } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { useLazyQuery } from '@apollo/client/react';
import {
  Badge,
  Button,
  Flex,
  Form,
  Popover,
  Select,
  Space,
  Tag,
} from 'antd';
import { FilterOutlined, SyncOutlined } from '@ant-design/icons';

import { DataSource, Formats } from 'meteor/idreesia-common/constants';
import {
  SecurityOperationType,
  SecurityOperationTypeDisplayName,
} from 'meteor/idreesia-common/constants/audit';
import { debounce } from 'meteor/idreesia-common/utilities/lodash';
import { message } from '/imports/ui/antd-feedback';
import { DateRangeField, SelectField } from '/imports/ui/modules/helpers/fields';

import { SECURITY_LOG_USERS } from './gql';

interface PageParams {
  pageIndex: number;
  dataSource?: string;
  operationType?: string;
  userId?: string;
  operationTimeBetween?: string;
}

export interface SecurityLogsFilterFormValues {
  dataSource?: string;
  operationType?: string;
  userId?: string;
  operationTimeBetween?: [Dayjs | null, Dayjs | null];
}

export interface SecurityLogsListFilterProps {
  setPageParams(params: PageParams): void;
  refreshData?: () => Promise<unknown>;
  dataSource?: string;
  operationType?: string;
  userId?: string;
  operationTimeBetween?: string;
  selectedUserName?: string | null;
}

interface FilterChip {
  key: 'dataSource' | 'operationType' | 'userId' | 'operationTimeBetween';
  label: string;
  value: string;
}

const FilterPanelStyle: CSSProperties = {
  width: 640,
  paddingTop: 4,
  overflow: 'visible',
};

const FilterFormStyle: CSSProperties = { width: '100%' };

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const dataSourceOptions = Object.values(DataSource).map((value) => ({
  _id: value,
  name: value,
}));

const operationTypeOptions = Object.values(SecurityOperationType).map((value) => ({
  _id: value,
  name: SecurityOperationTypeDisplayName[value] || value,
}));

const hasFilterValue = (value?: string | null) =>
  value != null && String(value).trim() !== '';

const parseTimeBetween = (value?: string) => {
  if (!value) return ['', ''] as [string, string];
  try {
    const dates = JSON.parse(value);
    return [dates?.[0] || '', dates?.[1] || ''] as [string, string];
  } catch {
    return ['', ''] as [string, string];
  }
};

export const getSecurityLogsFilterChips = ({
  dataSource,
  operationType,
  userId,
  operationTimeBetween,
  selectedUserName,
}: Pick<
  SecurityLogsListFilterProps,
  | 'dataSource'
  | 'operationType'
  | 'userId'
  | 'operationTimeBetween'
  | 'selectedUserName'
>): FilterChip[] => {
  const chips: FilterChip[] = [];

  if (hasFilterValue(dataSource)) {
    chips.push({ key: 'dataSource', label: 'Source', value: String(dataSource) });
  }
  if (hasFilterValue(operationType)) {
    chips.push({
      key: 'operationType',
      label: 'Operation',
      value:
        SecurityOperationTypeDisplayName[String(operationType)] ||
        String(operationType),
    });
  }
  if (hasFilterValue(userId)) {
    chips.push({
      key: 'userId',
      label: 'User',
      value: selectedUserName || String(userId),
    });
  }

  const [start, end] = parseTimeBetween(operationTimeBetween);
  if (start || end) {
    const format = (value: string) =>
      value ? dayjs(value).format(Formats.DATE_TIME_FORMAT) : '…';
    chips.push({
      key: 'operationTimeBetween',
      label: 'Time',
      value: `${format(start)} – ${format(end)}`,
    });
  }

  return chips;
};

export const SecurityLogsListFilterChips = ({
  setPageParams,
  dataSource,
  operationType,
  userId,
  operationTimeBetween,
  selectedUserName,
}: SecurityLogsListFilterProps) => {
  const chips = useMemo(
    () =>
      getSecurityLogsFilterChips({
        dataSource,
        operationType,
        userId,
        operationTimeBetween,
        selectedUserName,
      }),
    [dataSource, operationType, userId, operationTimeBetween, selectedUserName]
  );

  if (chips.length === 0) return null;

  const clearChip = (key: FilterChip['key']) => {
    if (key === 'operationTimeBetween') {
      setPageParams({
        pageIndex: 0,
        operationTimeBetween: JSON.stringify(['', '']),
      });
      return;
    }

    setPageParams({ pageIndex: 0, [key]: '' });
  };

  const clearAll = () => {
    setPageParams({
      pageIndex: 0,
      dataSource: '',
      operationType: '',
      userId: '',
      operationTimeBetween: JSON.stringify(['', '']),
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
  dataSource,
  operationType,
  userId,
  operationTimeBetween,
  selectedUserName,
}: SecurityLogsListFilterProps) => {
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);
  const [userOptions, setUserOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [searchUsers, { loading: userSearchLoading }] = useLazyQuery(
    SECURITY_LOG_USERS
  );

  const [start, end] = parseTimeBetween(operationTimeBetween);
  const operationTimeInitialValue = [
    start ? dayjs(start) : null,
    end ? dayjs(end) : null,
  ] as [Dayjs | null, Dayjs | null];

  const activeFilterCount = getSecurityLogsFilterChips({
    dataSource,
    operationType,
    userId,
    operationTimeBetween,
    selectedUserName,
  }).length;

  const syncFormValues = () => {
    form.setFieldsValue({
      dataSource,
      operationType,
      userId,
      operationTimeBetween: operationTimeInitialValue,
    });
    setUserOptions(
      userId ? [{ value: userId, label: selectedUserName || userId }] : []
    );
  };

  const handleUserSearch = useMemo(
    () =>
      debounce((value: string) => {
        if (!value || value.trim().length < 2) {
          setUserOptions([]);
          return;
        }
        searchUsers({ variables: { search: value } }).then(({ data }) => {
          setUserOptions(
            (data?.securityLogUsers ?? []).map((user) => ({
              value: user._id,
              label: user.name,
            }))
          );
        });
      }, 300),
    [searchUsers]
  );

  const handleFinish = (values: SecurityLogsFilterFormValues) => {
    setPageParams({
      pageIndex: 0,
      dataSource: values.dataSource,
      operationType: values.operationType,
      userId: values.userId,
      operationTimeBetween: JSON.stringify([
        values.operationTimeBetween?.[0]
          ? values.operationTimeBetween[0].toISOString()
          : '',
        values.operationTimeBetween?.[1]
          ? values.operationTimeBetween[1].toISOString()
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
        <SelectField
          data={dataSourceOptions}
          getDataValue={(item) => item._id}
          getDataText={(item) => item.name}
          initialValue={dataSource}
          fieldName="dataSource"
          fieldLabel="Source"
          fieldLayout={formItemLayout}
        />
        <SelectField
          data={operationTypeOptions}
          getDataValue={(item) => item._id}
          getDataText={(item) => item.name}
          initialValue={operationType}
          fieldName="operationType"
          fieldLabel="Operation"
          fieldLayout={formItemLayout}
        />
        <Form.Item
          name="userId"
          label="User"
          initialValue={userId}
          {...formItemLayout}
        >
          <Select
            showSearch
            allowClear
            filterOption={false}
            notFoundContent={userSearchLoading ? 'Searching…' : 'Type to search'}
            onSearch={handleUserSearch}
            options={userOptions}
            placeholder="Search by name, username, or email"
          />
        </Form.Item>
        <DateRangeField
          fieldName="operationTimeBetween"
          fieldLabel="Time"
          required={false}
          showTime
          fieldLayout={formItemLayout}
          initialValue={operationTimeInitialValue}
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
