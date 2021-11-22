import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Button, Collapse, Form, Row } from 'antd';

import { RefreshButton } from '/imports/ui/modules/helpers/controls';
import { Formats } from 'meteor/idreesia-common/constants';
import {
  CheckboxGroupField,
  DateField,
} from '/imports/ui/modules/helpers/fields';

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
    refreshData: PropTypes.func,
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

  handleReset = () => {
    const { refreshPage } = this.props;
    refreshPage({
      approvalStatus: ['approved', 'unapproved'],
      startDate: null,
      endDate: null,
      pageIndex: 0,
    });
  };

  refreshButton = () => <RefreshButton refreshData={this.props.refreshData} />;

  render() {
    const {
      queryParams: { startDate, endDate, showApproved, showUnapproved },
    } = this.props;

    const mStartDate = moment(startDate, Formats.DATE_FORMAT);
    const mEndDate = moment(endDate, Formats.DATE_FORMAT);
    const status = [];
    if (!showApproved || showApproved === 'true') status.push('approved');
    if (!showUnapproved || showUnapproved === 'true') status.push('unapproved');

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1" extra={this.refreshButton()}>
          <Form layout="horizontal" onSubmit={this.handleSubmit}>
            <CheckboxGroupField
              fieldName="approvalStatus"
              fieldLabel="Status"
              fieldLayout={formItemLayout}
              options={[
                { label: 'Approved', value: 'approved' },
                { label: 'Unapproved', value: 'unapproved' },
              ]}
              initialValue={status}
            />
            <DateField
              fieldName="startDate"
              fieldLabel="Start Date"
              fieldLayout={formItemLayout}
              required={false}
              initialValue={mStartDate.isValid() ? mStartDate : null}
            />
            <DateField
              fieldName="endDate"
              fieldLabel="End Date"
              fieldLayout={formItemLayout}
              required={false}
              initialValue={mEndDate.isValid() ? mEndDate : null}
            />
            <Form.Item {...buttonItemLayout}>
              <Row type="flex" justify="end">
                <Button type="default" onClick={this.handleReset}>
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

export default ListFilter;
