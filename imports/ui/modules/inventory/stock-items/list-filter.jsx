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
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    queryParams: PropTypes.object,
    allPhysicalStores: PropTypes.array,
    allItemCategories: PropTypes.array,
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, location, queryParams } = this.props;
    const { pageIndex, pageSize } = queryParams;

    form.validateFields((err, { physicalStoreId, itemCategoryId, itemTypeName }) => {
      if (err) return;
      const path = `${location.pathname}?physicalStoreId=${physicalStoreId ||
        ''}&itemCategoryId=${itemCategoryId || ''}&itemTypeName=${itemTypeName ||
        ''}&pageIndex=${pageIndex || 0}&pageSize=${pageSize || 10}`;
      history.push(path);
    });
  };

  render() {
    const { allPhysicalStores, allItemCategories, queryParams } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1">
          <Form layout="horizontal" onSubmit={this.handleSubmit}>
            <SelectField
              data={allPhysicalStores}
              getDataValue={({ _id }) => _id}
              getDataText={({ name }) => name}
              fieldName="physicalStoreId"
              fieldLabel="Physical Store"
              fieldLayout={formItemLayout}
              initialValue={queryParams.physicalStoreId}
              getFieldDecorator={getFieldDecorator}
            />
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
