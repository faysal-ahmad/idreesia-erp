import React, { useMemo, useState, type CSSProperties } from 'react';
import { Badge, Button, Flex, Form, Popover, Space, Tag } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { FilterOutlined, SyncOutlined } from '@ant-design/icons';

import { ModuleNames } from 'meteor/idreesia-common/constants';
import { values } from 'meteor/idreesia-common/utilities/lodash';
import { CheckboxGroupField, SelectField } from '/imports/ui/modules/helpers/fields';

export interface PageParams {
  showLocked?: string;
  showUnlocked?: string;
  showActive?: string;
  showInactive?: string;
  moduleAccess?: string;
  pageIndex?: string | number;
  pageSize?: string | number;
}

export interface UserListFilterProps {
  showLocked?: string;
  showUnlocked?: string;
  showActive?: string;
  showInactive?: string;
  moduleAccess?: string;
  setPageParams(params: PageParams): void;
  refreshData?: () => void;
}

interface FormValues {
  status?: string[];
  moduleAccess?: string;
}

interface ModuleNameOption {
  value: string;
  text: string;
}

interface FilterChip {
  key: 'status' | 'moduleAccess';
  label: string;
  value: string;
}

const DEFAULT_STATUS = ['unlocked', 'active', 'inactive'];

const STATUS_LABELS: Record<string, string> = {
  locked: 'Locked',
  unlocked: 'Unlocked',
  active: 'Active',
  inactive: 'Inactive',
};

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

const getStatus = ({
  showLocked,
  showUnlocked,
  showActive,
  showInactive,
}: Pick<
  UserListFilterProps,
  'showLocked' | 'showUnlocked' | 'showActive' | 'showInactive'
>): string[] => {
  const status: string[] = [];
  if (showLocked === 'true') status.push('locked');
  if (showUnlocked !== 'false') status.push('unlocked');
  if (showActive !== 'false') status.push('active');
  if (showInactive !== 'false') status.push('inactive');
  return status;
};

const sameStatus = (a: string[], b: string[]) =>
  a.length === b.length && a.every(value => b.includes(value));

export const getUserFilterChips = (
  props: Pick<
    UserListFilterProps,
    'showLocked' | 'showUnlocked' | 'showActive' | 'showInactive' | 'moduleAccess'
  >
): FilterChip[] => {
  const chips: FilterChip[] = [];
  const status = getStatus(props);

  if (!sameStatus(status, DEFAULT_STATUS)) {
    chips.push({
      key: 'status',
      label: 'Status',
      value: status.length
        ? status.map(value => STATUS_LABELS[value]).join(', ')
        : 'None',
    });
  }

  if (props.moduleAccess) {
    chips.push({
      key: 'moduleAccess',
      label: 'Module Access',
      value: props.moduleAccess,
    });
  }

  return chips;
};

export const UserFilterChips = (props: UserListFilterProps) => {
  const { setPageParams, showLocked, showUnlocked, showActive, showInactive, moduleAccess } = props;
  const chips = useMemo(
    () => getUserFilterChips({ showLocked, showUnlocked, showActive, showInactive, moduleAccess }),
    [showLocked, showUnlocked, showActive, showInactive, moduleAccess]
  );

  if (chips.length === 0) return null;

  const clearChip = (key: FilterChip['key']) => {
    if (key === 'status') {
      setPageParams({
        pageIndex: '0',
        showLocked: 'false',
        showUnlocked: 'true',
        showActive: 'true',
        showInactive: 'true',
      });
      return;
    }

    setPageParams({ pageIndex: '0', moduleAccess: '' });
  };

  const clearAll = () => {
    setPageParams({
      pageIndex: '0',
      showLocked: 'false',
      showUnlocked: 'true',
      showActive: 'true',
      showInactive: 'true',
      moduleAccess: '',
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

const ListFilter = (props: UserListFilterProps) => {
  const { setPageParams, refreshData, showLocked, showUnlocked, showActive, showInactive, moduleAccess } = props;
  const [form] = Form.useForm<FormValues>();
  const [open, setOpen] = useState(false);

  const status = getStatus({ showLocked, showUnlocked, showActive, showInactive });
  const activeFilterCount = getUserFilterChips({
    showLocked,
    showUnlocked,
    showActive,
    showInactive,
    moduleAccess,
  }).length;

  const syncFormValues = () => {
    form.setFieldsValue({ status, moduleAccess });
  };

  const handleFinish = ({ status: nextStatus = [], moduleAccess: nextModuleAccess = '' }: FormValues) => {
    setPageParams({
      showLocked: nextStatus.indexOf('locked') !== -1 ? 'true' : 'false',
      showUnlocked: nextStatus.indexOf('unlocked') !== -1 ? 'true' : 'false',
      showActive: nextStatus.indexOf('active') !== -1 ? 'true' : 'false',
      showInactive: nextStatus.indexOf('inactive') !== -1 ? 'true' : 'false',
      moduleAccess: nextModuleAccess,
      pageIndex: '0',
    });
    setOpen(false);
  };

  const handleRefresh = () => {
    if (!refreshData) return;
    refreshData();
    message.success('Data Reloaded', 2);
  };

  const moduleNames = values(ModuleNames);
  const moduleNamesData = moduleNames.map((name: string) => ({
    value: name,
    text: name,
  }));

  const filterForm = (
    <div className="list-filter-panel" style={FilterPanelStyle}>
      <Form
        form={form}
        layout="horizontal"
        style={FilterFormStyle}
        onFinish={handleFinish}
      >
        <CheckboxGroupField
          fieldName="status"
          fieldLabel="Status"
          fieldLayout={formItemLayout}
          options={[
            { label: 'Locked Users', value: 'locked' },
            { label: 'Unlocked Users', value: 'unlocked' },
            { label: 'Currently Active', value: 'active' },
            { label: 'Currently Inactive', value: 'inactive' },
          ]}
          initialValue={status}
        />
        <SelectField
          data={moduleNamesData}
          getDataValue={({ value }: ModuleNameOption) => value}
          getDataText={({ text }: ModuleNameOption) => text}
          initialValue={moduleAccess}
          fieldName="moduleAccess"
          fieldLabel="Module Access"
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
