import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Button, Collapse, Form, Row } from '/imports/ui/controls';
import { Formats } from 'meteor/idreesia-common/constants';
import {
  TreeSelectField,
  CheckboxGroupField,
  DateField,
} from '/imports/ui/modules/helpers/fields';
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

class ListFilter extends Component {
  static propTypes = {
    form: PropTypes.object,

    allLocations: PropTypes.array,
    refreshPage: PropTypes.func,
    queryParams: PropTypes.object,
    refreshData: PropTypes.func,
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, refreshPage } = this.props;

    form.validateFields(
      (err, { approvalStatus, locationId, startDate, endDate }) => {
        if (err) return;
        refreshPage({
          approvalStatus,
          locationId,
          startDate,
          endDate,
          pageIndex: 0,
        });
      }
    );
  };

  handleReset = () => {
    const { refreshPage } = this.props;
    refreshPage({
      approvalStatus: ['approved', 'unapproved'],
      locationId: '',
      startDate: null,
      endDate: null,
      pageIndex: 0,
    });
  };

  refreshButton = () => <RefreshButton refreshData={this.props.refreshData} />;

  render() {
    const { allLocations } = this.props;
    const {
      queryParams: {
        startDate,
        endDate,
        locationId,
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
            <TreeSelectField
              data={allLocations}
              fieldName="locationId"
              fieldLabel="Location"
              fieldLayout={formItemLayout}
              initialValue={locationId}
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

export default Form.create()(ListFilter);
