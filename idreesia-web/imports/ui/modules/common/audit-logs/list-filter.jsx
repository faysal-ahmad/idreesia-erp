import React from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse, Form, Row } from 'antd';

import { RefreshButton } from '/imports/ui/modules/helpers/controls';
import { InputTextField } from '/imports/ui/modules/helpers/fields';

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

const ListFilter = props => {
  const { refreshData } = props;

  const handleFinish = ({ entityId }) => {
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
    <Collapse style={ContainerStyle}>
      <Collapse.Panel header="Filter" key="1" extra={refreshButton()}>
        <Form layout="horizontal" onFinish={handleFinish}>
          <InputTextField
            fieldName="entityId"
            fieldLabel="Entity ID"
            fieldLayout={formItemLayout}
            initialValue={entityId}
          />
          <Form.Item {...buttonItemLayout}>
            <Row type="flex" justify="end">
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
      </Collapse.Panel>
    </Collapse>
  );
};

ListFilter.propTypes = {
  entityId: PropTypes.string,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,
};

export default ListFilter;
