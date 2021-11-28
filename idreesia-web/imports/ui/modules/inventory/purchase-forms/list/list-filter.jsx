import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Button, Collapse, Form, Row } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import {
  CheckboxGroupField,
  DateField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';
import { RefreshButton } from '/imports/ui/modules/helpers/controls';
import { WithVendorsByPhysicalStore } from '/imports/ui/modules/inventory/common/composers';

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
    refreshPage: PropTypes.func,
    refreshData: PropTypes.func,
    queryParams: PropTypes.object,
    vendorsLoading: PropTypes.bool,
    vendorsByPhysicalStoreId: PropTypes.array,
  };

  handleFinish = ({ approvalStatus, startDate, endDate, vendorId }) => {
    const { refreshPage } = this.props;
    refreshPage({
      approvalStatus,
      startDate,
      endDate,
      vendorId,
      pageIndex: 0,
    });
  };

  handleReset = () => {
    const { refreshPage } = this.props;
    refreshPage({
      approvalStatus: ['approved', 'unapproved'],
      vendorId: '',
      startDate: null,
      endDate: null,
      pageIndex: 0,
    });
  };

  refreshButton = () => <RefreshButton refreshData={this.props.refreshData} />;

  render() {
    const { vendorsLoading, vendorsByPhysicalStoreId } = this.props;
    if (vendorsLoading) return null;
    const {
      queryParams: {
        startDate,
        endDate,
        vendorId,
        showApproved,
        showUnapproved,
      },
    } = this.props;

    const mStartDate = moment(startDate, Formats.DATE_FORMAT);
    const mEndDate = moment(endDate, Formats.DATE_FORMAT);
    const status = [];
    if (!showApproved || showApproved === 'true') status.push('approved');
    if (!showUnapproved || showUnapproved === 'true') status.push('unapproved');

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1" extra={this.refreshButton()}>
          <Form layout="horizontal" onFinish={this.handleFinish}>
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
            <SelectField
              data={vendorsByPhysicalStoreId}
              getDataValue={({ _id }) => _id}
              getDataText={({ name }) => name}
              fieldName="vendorId"
              fieldLabel="Vendor"
              fieldLayout={formItemLayout}
              initialValue={vendorId}
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

export default WithVendorsByPhysicalStore()(ListFilter);
