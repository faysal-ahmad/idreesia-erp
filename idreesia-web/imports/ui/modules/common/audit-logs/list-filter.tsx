import React, { type CSSProperties } from 'react';
import { Button, Collapse, Form, Row } from 'antd';

import { RefreshButton } from '/imports/ui/modules/helpers/controls';
import { InputTextField } from '/imports/ui/modules/helpers/fields';

interface PageParams { pageIndex: number; entityId?: string | null; dataSource?: string | null; }
interface Props { entityId?: string | null; dataSource?: string | null; setPageParams(params: PageParams): void; refreshData?(): Promise<unknown>; }

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

  const handleFinish = ({ entityId }: { entityId?: string }) => {
    const { setPageParams } = props;
    setPageParams({
      entityId,
      pageIndex: 0,
    });
  };

  const handleReset = () => {
    const { setPageParams } = props;
    setPageParams({
      entityId: null,
      pageIndex: 0,
    });
  };

  const refreshButton = () => <RefreshButton refreshData={refreshData} />;

  const {
    entityId,
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
              <InputTextField
                fieldName="entityId"
                fieldLabel="Entity ID"
                fieldLayout={formItemLayout}
                initialValue={entityId}
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
