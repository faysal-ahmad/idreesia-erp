import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse, Form, Row, Button } from 'antd';
import moment from 'moment';

import { Formats } from '/imports/lib/constants';
import { CheckboxField, DateField } from '/imports/ui/modules/helpers/fields';

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
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, refreshPage } = this.props;

    form.validateFields((err, { approvalStatus, startDate, endDate }) => {
      if (err) return;
      refreshPage({
        approvalStatus,
        startDate,
        endDate,
        pageIndex: 0,
      });
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { queryParams } = this.props;

    const mStartDate = moment(queryParams.startDate, Formats.DATE_FORMAT);
    const mEndDate = moment(queryParams.endDate, Formats.DATE_FORMAT);
    const status = [];
    if (queryParams.showApproved === 'true') status.push('approved');
    if (queryParams.showUnapproved === 'true') status.push('unapproved');

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1">
          <Form layout="horizontal" onSubmit={this.handleSubmit}>
            <CheckboxField
              fieldName="approvalStatus"
              fieldLabel="Status"
              fieldLayout={formItemLayout}
              options={[
                { label: 'Approved', value: 'approved' },
                { label: 'Unapproved', value: 'unapproved' },
              ]}
              initialValue={status}
              getFieldDecorator={getFieldDecorator}
            />
            <DateField
              fieldName="startDate"
              fieldLabel="Start Date"
              fieldLayout={formItemLayout}
              required={false}
              initialValue={mStartDate.isValid() ? mStartDate : null}
              getFieldDecorator={getFieldDecorator}
            />
            <DateField
              fieldName="endDate"
              fieldLabel="End Date"
              fieldLayout={formItemLayout}
              required={false}
              initialValue={mEndDate.isValid() ? mEndDate : null}
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
