import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Button, Collapse, Form, Row } from 'antd';

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
    allLocations: PropTypes.array,
    refreshPage: PropTypes.func,
    queryParams: PropTypes.object,
    refreshData: PropTypes.func,
  };

  handleFinish = ({ approvalStatus, locationId, startDate, endDate }) => {
    const { refreshPage } = this.props;
    refreshPage({
      approvalStatus,
      locationId,
      startDate,
      endDate,
      pageIndex: 0,
    });
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

    const mStartDate = startDate ? dayjs(startDate, Formats.DATE_FORMAT) : null;
    const mEndDate = endDate ? dayjs(endDate, Formats.DATE_FORMAT) : null;
    const status = [];
    if (!showApproved || showApproved === 'true') status.push('approved');
    if (!showUnapproved || showUnapproved === 'true') status.push('unapproved');

    return (
      <Collapse
        style={ContainerStyle}
        items={[
          {
            key: '1',
            label: 'Filter',
            extra: this.refreshButton(),
            children: (
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
                  initialValue={
                    mStartDate && mStartDate.isValid() ? mStartDate : null
                  }
                />
                <DateField
                  fieldName="endDate"
                  fieldLabel="End Date"
                  fieldLayout={formItemLayout}
                  required={false}
                  initialValue={mEndDate && mEndDate.isValid() ? mEndDate : null}
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
            ),
          },
        ]}
      />
    );
  }
}

export default ListFilter;
