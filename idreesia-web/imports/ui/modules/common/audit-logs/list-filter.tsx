import React from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse, Form, Row } from 'antd';

import { RefreshButton } from '/imports/ui/modules/helpers/controls';
import { InputTextField } from '/imports/ui/modules/helpers/fields';

const AntButton = Button as any;
const AntCollapse = Collapse as any;
const AntForm = Form as any;
const AntFormItem = (Form as any).Item;
const AntRow = Row as any;
const RefreshControl = RefreshButton as any;
const TextField = InputTextField as any;
interface PageParams { pageIndex: number; entityId?: string | null; dataSource?: string | null; }
interface Props { entityId?: string | null; dataSource?: string | null; setPageParams(params: PageParams): void; refreshData?: () => void; }

const ContainerStyle = {
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

  const refreshButton = () => <RefreshControl refreshData={refreshData} />;

  const {
    entityId,
  } = props;

  return (
    <AntCollapse
      style={ContainerStyle as any}
      items={[
        {
          key: '1',
          label: 'Filter',
          extra: refreshButton(),
          children: (
            <AntForm layout="horizontal" onFinish={handleFinish}>
              <TextField
                fieldName="entityId"
                fieldLabel="Entity ID"
                fieldLayout={formItemLayout}
                initialValue={entityId}
              />
              <AntFormItem {...buttonItemLayout}>
                <AntRow type="flex" justify="end">
                  <AntButton type="default" onClick={handleReset}>
                    Reset
                  </AntButton>
                  &nbsp;
                  <AntButton type="primary" htmlType="submit">
                    Search
                  </AntButton>
                </AntRow>
              </AntFormItem>
            </AntForm>
          ),
        },
      ]}
    />
  );
};

ListFilter.propTypes = {
  entityId: PropTypes.string,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,
};

export default ListFilter;
