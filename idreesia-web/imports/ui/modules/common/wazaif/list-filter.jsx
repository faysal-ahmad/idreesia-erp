import React from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse, Form, Row } from 'antd';

import { InputTextField } from '/imports/ui/modules/helpers/fields';
import { RefreshButton } from '/imports/ui/modules/helpers/controls';

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

const ListFilter = ({ setPageParams, refreshData, name }) => {
  const [form] = Form.useForm();

  const handleReset = () => {
    form.resetFields();
    setPageParams({
      pageIndex: '0',
      name: '',
    });
  };

  const handleFinish = values => {
    setPageParams({
      pageIndex: 0,
      name: values.name,
    });
  };

  const refreshButton = () => <RefreshButton refreshData={refreshData} />;

  return (
    <Collapse style={ContainerStyle}>
      <Collapse.Panel header="Filter" key="1" extra={refreshButton()}>
        <Form form={form} layout="horizontal" handleFinish={handleFinish}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            required={false}
            fieldLayout={formItemLayout}
            initialValue={name}
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
  name: PropTypes.string,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,
};

export default ListFilter;
