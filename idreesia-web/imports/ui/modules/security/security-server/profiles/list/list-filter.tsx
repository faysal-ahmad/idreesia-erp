import React, { useState, type CSSProperties } from 'react';
import { Badge, Button, Flex, Form, Popover } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

import {
  CheckboxField,
  InputTextField,
} from '/imports/ui/modules/helpers/fields';

import type { FilterChip } from '../../common/filter-chips';

const FilterPanelStyle: CSSProperties = {
  width: 640,
  paddingTop: 4,
};

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

export interface ProfileFilterParams {
  name?: string | null;
  includeTest?: string | null;
  includeDeleted?: string | null;
}

interface FilterValues {
  name?: string;
  includeTest?: boolean;
  includeDeleted?: boolean;
}

export const getProfileFilterChips = ({
  name,
  includeTest,
  includeDeleted,
}: ProfileFilterParams): FilterChip[] => {
  const chips: FilterChip[] = [];
  if (name) chips.push({ key: 'name', label: 'Name', value: name });
  if (includeTest === 'true') {
    chips.push({ key: 'includeTest', label: 'Include', value: 'Test profiles' });
  }
  if (includeDeleted === 'true') {
    chips.push({
      key: 'includeDeleted',
      label: 'Include',
      value: 'Deleted profiles',
    });
  }
  return chips;
};

interface Props {
  queryParams: ProfileFilterParams;
  setPageParams(params: Record<string, string | number | null>): void;
}

const ListFilter = ({ queryParams, setPageParams }: Props) => {
  const [form] = Form.useForm<FilterValues>();
  const [open, setOpen] = useState(false);
  const { name, includeTest, includeDeleted } = queryParams;

  const syncFormValues = () => {
    form.setFieldsValue({
      name: name || undefined,
      includeTest: includeTest === 'true',
      includeDeleted: includeDeleted === 'true',
    });
  };

  const handleFinish = (values: FilterValues) => {
    setPageParams({
      name: values.name || null,
      includeTest: values.includeTest ? 'true' : null,
      includeDeleted: values.includeDeleted ? 'true' : null,
      pageIndex: 0,
    });
    setOpen(false);
  };

  const filterForm = (
    <div className="list-filter-panel" style={FilterPanelStyle}>
      <Form form={form} layout="horizontal" onFinish={handleFinish}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required={false}
          fieldLayout={formItemLayout}
        />
        <CheckboxField
          fieldName="includeTest"
          fieldLabel="Test Profiles"
          fieldLayout={formItemLayout}
        />
        <CheckboxField
          fieldName="includeDeleted"
          fieldLabel="Deleted Profiles"
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
      <Badge
        count={getProfileFilterChips(queryParams).length}
        size="small"
        offset={[-2, 2]}
      >
        <Button icon={<FilterOutlined />}>Filter</Button>
      </Badge>
    </Popover>
  );
};

export default ListFilter;
