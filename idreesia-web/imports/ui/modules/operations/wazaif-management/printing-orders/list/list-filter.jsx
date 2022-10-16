import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Button, Collapse, Form, Row } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import {
  SelectField,
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

const ListFilter = ({
  allWazaifVendors,
  refreshPage,
  queryParams,
  refreshData,
}) => {
  const handleFinish = ({ completedStatus, vendorId, startDate, endDate }) => {
    refreshPage({
      completedStatus,
      vendorId,
      startDate,
      endDate,
      pageIndex: 0,
    });
  };

  const handleReset = () => {
    refreshPage({
      completedStatus: ['pending', 'completed'],
      vendorId: null,
      startDate: null,
      endDate: null,
      pageIndex: 0,
    });
  };

  const refreshButton = () => <RefreshButton refreshData={refreshData} />;

  const {
    startDate,
    endDate,
    vendorId,
    showPending,
    showCompleted,
  } = queryParams;

  const mStartDate = moment(startDate, Formats.DATE_FORMAT);
  const mEndDate = moment(endDate, Formats.DATE_FORMAT);
  const status = [];
  if (!showPending || showPending === 'true') status.push('pending');
  if (!showCompleted || showCompleted === 'true') status.push('completed');

  return (
    <Collapse style={ContainerStyle}>
      <Collapse.Panel header="Filter" key="1" extra={refreshButton()}>
        <Form layout="horizontal" onFinish={handleFinish}>
          <CheckboxGroupField
            fieldName="completedStatus"
            fieldLabel="Status"
            fieldLayout={formItemLayout}
            options={[
              { label: 'Pending', value: 'pending' },
              { label: 'Completed', value: 'completed' },
            ]}
            initialValue={status}
          />
          <SelectField
            data={allWazaifVendors}
            getDataValue={({ _id }) => _id}
            getDataText={({ name }) => name}
            allowClear
            initialValue={vendorId}
            fieldName="vendorId"
            fieldLabel="Vendor"
            fieldLayout={formItemLayout}
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
}

ListFilter.propTypes = {
  allWazaifVendors: PropTypes.array,
  refreshPage: PropTypes.func,
  queryParams: PropTypes.object,
  refreshData: PropTypes.func,
};

export default ListFilter;
