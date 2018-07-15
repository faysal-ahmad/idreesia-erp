import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse, Form, Row, Button } from 'antd';

import { InputTextField, SelectField } from '/imports/ui/modules/helpers/fields';

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

class ListFilter extends Component {
  static propTypes = {
    form: PropTypes.object,

    refreshPage: PropTypes.func,
    queryParams: PropTypes.object,
    allItemCategories: PropTypes.array,
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, refreshPage } = this.props;

    form.validateFields((err, { itemCategoryId, itemTypeName }) => {
      if (err) return;
      refreshPage({
        itemCategoryId,
        itemTypeName,
        pageIndex: 0,
      });
    });
  };

  render() {
    const { allItemCategories, queryParams } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1">
          <Form layout="horizontal" onSubmit={this.handleSubmit}>
            <SelectField
              data={allItemCategories}
              getDataValue={({ _id }) => _id}
              getDataText={({ name }) => name}
              fieldName="itemCategoryId"
              fieldLabel="Item Category"
              fieldLayout={formItemLayout}
              initialValue={queryParams.itemCategoryId}
              getFieldDecorator={getFieldDecorator}
            />
            <InputTextField
              fieldName="itemTypeName"
              fieldLabel="Name"
              required={false}
              fieldLayout={formItemLayout}
              getFieldDecorator={getFieldDecorator}
            />
            <Form.Item {...buttonItemLayout}>
              <Row type="flex" justify="end">
                <Button type="secondary" onClick={this.handleCancel}>
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
  }
}

export default Form.create()(ListFilter);
