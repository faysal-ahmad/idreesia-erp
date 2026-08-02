import React, { type CSSProperties } from 'react';
import { SyncOutlined } from '@ant-design/icons';
import {
  Button,
  Collapse,
  Form,
  Row,
  Tooltip,
} from 'antd';

import { ModuleNames } from 'meteor/idreesia-common/constants';
import { values } from 'meteor/idreesia-common/utilities/lodash';
import {
  CheckboxGroupField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';

export interface PageParams {
  showLocked?: string;
  showUnlocked?: string;
  showActive?: string;
  showInactive?: string;
  moduleAccess?: string;
  pageIndex?: string | number;
  pageSize?: string | number;
}

interface Props {
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

const ContainerStyle: CSSProperties = {
  width: '500px',
};

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 },
};

const buttonItemLayout = {
  wrapperCol: { span: 12, offset: 4 },
};

const ListFilter = (props: Props) => {
  const handleFinish = ({ status = [], moduleAccess = '' }: FormValues) => {
    const { setPageParams } = props;
    setPageParams({
      showLocked: status.indexOf('locked') !== -1 ? 'true' : 'false',
      showUnlocked: status.indexOf('unlocked') !== -1 ? 'true' : 'false',
      showActive: status.indexOf('active') !== -1 ? 'true' : 'false',
      showInactive: status.indexOf('inactive') !== -1 ? 'true' : 'false',
      moduleAccess,
      pageIndex: '0',
    });
  };

  const handleReset = () => {
    const { setPageParams } = props;
    setPageParams({
      showLocked: 'false',
      showUnlocked: 'true',
      showActive: 'true',
      showInactive: 'true',
      moduleAccess: '',
      pageIndex: '0',
    });
  };

  const refreshButton = () => {
    const { refreshData } = props;
    if (!refreshData) return null;

    return (
      <Tooltip title="Reload Data">
        <SyncOutlined
          onClick={(event: React.MouseEvent<HTMLElement>) => {
            event.stopPropagation();
            refreshData();
          }}
        />
      </Tooltip>
    );
  };

  const {
    showLocked,
    showUnlocked,
    showActive,
    showInactive,
    moduleAccess,
  } = props;

  const status: string[] = [];
  if (showLocked === 'true') status.push('locked');
  if (showUnlocked === 'true') status.push('unlocked');
  if (showActive === 'true') status.push('active');
  if (showInactive === 'true') status.push('inactive');

  const moduleNames = values(ModuleNames);
  const moduleNamesData = moduleNames.map((name: string) => ({
    value: name,
    text: name,
  }));

  return (
    <Collapse
      style={ContainerStyle}
      items={[
        {
          key: '1',
          label: 'Filter',
          extra: refreshButton(),
          children: (
            <Form layout="horizontal" onFinish={handleFinish}>
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
              <Form.Item {...buttonItemLayout}>
                <Row justify="end">
                  <Button type="default" onClick={handleReset}>
                    Reset
                  </Button>
                  &nbsp;
                  <Button type="primary" htmlType="submit">
                    Search
                  </Button>
                </Row>
              </Form.Item>
            </Form>
          ),
        },
      ]}
    />
  );
};

export default ListFilter;
