import React, { type CSSProperties } from 'react';
import { Button, Collapse, Form, Row } from 'antd';

import { DataSource } from 'meteor/idreesia-common/constants';

import { SelectField } from '/imports/ui/modules/helpers/fields';
import { RefreshButton } from '/imports/ui/modules/helpers/controls';

interface PageParams { pageIndex: number; entityId?: string | null; dataSource?: string | null; }
interface Props { entityId?: string | null; dataSource?: string | null; setPageParams(params: PageParams): void; refreshData?: () => Promise<unknown>; }
interface LabelValue { label: string; value: string; }

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
  const { refreshData } = props;

  const handleFinish = ({ dataSource }: { dataSource?: string }) => {
    const { setPageParams } = props;
    setPageParams({
      dataSource,
      pageIndex: 0,
    });
  };

  const handleReset = () => {
    const { setPageParams } = props;
    setPageParams({
      dataSource: null,
      pageIndex: 0,
    });
  };

  const refreshButton = () => <RefreshButton refreshData={refreshData} />;

  const {
    dataSource,
  } = props;

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
              <SelectField
                fieldName="dataSource"
                fieldLabel="Data Source"
                required={false}
                data={[
                  {
                    label: 'Outstation',
                    value: DataSource.OUTSTATION,
                  },
                  {
                    label: 'Portals',
                    value: DataSource.PORTAL,
                  },
                ]}
                getDataValue={({ value }: LabelValue) => value}
                getDataText={({ label }: LabelValue) => label}
                initialValue={dataSource}
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
