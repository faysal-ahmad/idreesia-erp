import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { SyncOutlined } from '@ant-design/icons';
import {
  Button,
  Collapse,
  Form,
  Row,
  Tooltip,
} from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import {
  DateRangeField,
  InputTextField,
  InputCnicField,
  SelectField,
  DateField,
} from '/imports/ui/modules/helpers/fields';

const ContainerStyle = {
  width: '500px',
};

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 12 },
};

const buttonItemLayout = {
  wrapperCol: { span: 12, offset: 4 },
};

class ListFilter extends Component {
  static propTypes = {
    name: PropTypes.string,
    cnicNumber: PropTypes.string,
    paymentNumber: PropTypes.string,
    paymentTypeId: PropTypes.string,
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    updatedBetween: PropTypes.string,
    allPaymentTypes: PropTypes.array,
    setPageParams: PropTypes.func,
    refreshData: PropTypes.func,
  };

  handleFinish = ({
    paymentNumber,
    name,
    cnicNumber,
    paymentTypeId,
    startDate,
    endDate,
    updatedBetween,
  }) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: '0',
      paymentNumber,
      name,
      cnicNumber,
      paymentTypeId,
      startDate: startDate ? startDate.format(Formats.DATE_FORMAT) : null,
      endDate: endDate ? endDate.format(Formats.DATE_FORMAT) : null,
      updatedBetween: JSON.stringify([
        updatedBetween[0]
          ? updatedBetween[0].format(Formats.DATE_FORMAT)
          : '',
        updatedBetween[1]
          ? updatedBetween[1].format(Formats.DATE_FORMAT)
          : '',
      ]),
    });
  };

  handleReset = () => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: '0',
      paymentNumber: null,
      name: null,
      cnicNumber: null,
      paymentTypeId: null,
      startDate: null,
      endDate: null,
      updatedBetween: JSON.stringify(['', '']),
    });
  };

  refreshButton = () => {
    const { refreshData } = this.props;

    return (
      <Tooltip title="Reload Data">
        <SyncOutlined
          onClick={event => {
            event.stopPropagation();
            if (refreshData) refreshData();
          }}
        />
      </Tooltip>
    );
  };

  render() {
    const {
      paymentNumber,
      name,
      cnicNumber,
      paymentTypeId,
      startDate,
      endDate,
      allPaymentTypes,
      updatedBetween,
    } = this.props;

    const mStartDate = moment(startDate, Formats.DATE_FORMAT);
    const mEndDate = moment(endDate, Formats.DATE_FORMAT);

    let initialValue;
    if (updatedBetween) {
      const dates = updatedBetween ? JSON.parse(updatedBetween) : null;
      initialValue = [
        dates[0] ? moment(dates[0], Formats.DATE_FORMAT) : null,
        dates[1] ? moment(dates[1], Formats.DATE_FORMAT) : null,
      ];
    } else {
      initialValue = [null, null];
    }

    const updatedBetweenField = (
      <DateRangeField
        fieldName="updatedBetween"
        fieldLabel="Updated"
        required={false}
        fieldLayout={formItemLayout}
        initialValue={initialValue}
      />
    );

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1" extra={this.refreshButton()}>
          <Form layout="horizontal" onFinish={this.handleFinish}>
            <InputTextField
              fieldName="paymentNumber"
              fieldLabel="Voucher No."
              fieldLayout={formItemLayout}
              initialValue={paymentNumber}
            />

            <SelectField
              data={allPaymentTypes}
              getDataValue={({ _id }) => _id}
              getDataText={({ name: _name }) => _name}
              initialValue={paymentTypeId}
              fieldName="paymentTypeId"
              fieldLabel="Payment Type"
              fieldLayout={formItemLayout}
            />

            <InputTextField
              fieldName="name"
              fieldLabel="Name"
              fieldLayout={formItemLayout}
              initialValue={name}
            />

            <InputCnicField
              fieldName="cnicNumber"
              fieldLabel="CNIC Number"
              fieldLayout={formItemLayout}
              initialValue={cnicNumber}
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

            {updatedBetweenField}

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
