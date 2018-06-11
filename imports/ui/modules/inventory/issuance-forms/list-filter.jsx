import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse, Form, Row, Button } from 'antd';

import { CheckboxField, DateField, SelectField } from '/imports/ui/modules/helpers/fields';

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
    allPhysicalStores: PropTypes.array,
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, refreshPage } = this.props;

    form.validateFields((err, { physicalStoreId, approvalStatus, startDate, endDate }) => {
      if (err) return;
      refreshPage({
        physicalStoreId,
        approvalStatus,
        startDate,
        endDate,
        pageIndex: 0,
      });
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { allPhysicalStores, queryParams } = this.props;

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
            <CheckboxField
              fieldName="approvalStatus"
              fieldLabel="Status"
              fieldLayout={formItemLayout}
              options={[
                { label: 'Approved', value: 'approved' },
                { label: 'Unapproved', value: 'unapproved' },
              ]}
              initialValue={['approved', 'unapproved']}
              getFieldDecorator={getFieldDecorator}
            />
            <DateField
              fieldName="startDate"
              fieldLabel="Start Date"
              fieldLayout={formItemLayout}
              required={false}
              getFieldDecorator={getFieldDecorator}
            />
            <DateField
              fieldName="endDate"
              fieldLabel="End Date"
              fieldLayout={formItemLayout}
              required={false}
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
