import React from 'react';
import PropTypes from 'prop-types';

import { Button, Collapse, Form, Row } from '/imports/ui/controls';
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

const ListFilter = ({ form, setPageParams, refreshData, name }) => {
  const handleReset = () => {
    form.resetFields();
    setPageParams({
      pageIndex: '0',
      name: '',
    });
  };

  const handleSubmit = () => {
    form.validateFields((err, values) => {
      if (err) return;
      setPageParams({
        pageIndex: 0,
        name: values.name,
      });
    });
  };

  const refreshButton = () => <RefreshButton refreshData={refreshData} />;

  const { getFieldDecorator } = form;
  return (
    <Collapse style={ContainerStyle}>
      <Collapse.Panel header="Filter" key="1" extra={refreshButton()}>
        <Form layout="horizontal">
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            required={false}
            fieldLayout={formItemLayout}
            initialValue={name}
            getFieldDecorator={getFieldDecorator}
          />
          <Form.Item {...buttonItemLayout}>
            <Row type="flex" justify="end">
              <Button type="default" onClick={handleReset}>
                Reset
              </Button>
              &nbsp;
              <Button type="primary" onClick={handleSubmit}>
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
  form: PropTypes.object,
  name: PropTypes.string,
  setPageParams: PropTypes.func,
  refreshData: PropTypes.func,
};

export default Form.create({ name: 'wazaifListFilter' })(ListFilter);
