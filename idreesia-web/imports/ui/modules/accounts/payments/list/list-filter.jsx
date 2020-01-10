import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import { Collapse, Form, Row, Button } from '/imports/ui/controls';
import {
  InputTextField,
  InputNumberField,
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
    form: PropTypes.object,

    name: PropTypes.string,
    fatherName: PropTypes.string,
    cnicNumber: PropTypes.string,
    contactNumber: PropTypes.string,
    paymentNumber: PropTypes.string,
    paymentType: PropTypes.string,
    paymentAmount: PropTypes.string,
    description: PropTypes.string,

    hasPortion: PropTypes.string,
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    setPageParams: PropTypes.func,
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, setPageParams } = this.props;

    form.validateFields(
      (
        err,
        { name, cnicNumber, paymentType, paymentAmount, startDate, endDate }
      ) => {
        if (err) return;
        setPageParams({
          name,
          cnicNumber,
          paymentType,
          paymentAmount,
          startDate,
          endDate,
          pageIndex: 0,
        });
      }
    );
  };

  handleReset = () => {
    const { setPageParams } = this.props;
    setPageParams({
      name,
      cnicNumber: null,
      paymentType: null,
      paymentAmount: null,
      paymentDate: null,
      startDate: null,
      endDate: null,
      pageIndex: 0,
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      startDate,
      endDate,
      name,
      cnicNumber,
      paymentType,
      paymentAmount,
    } = this.props;

    const mStartDate = moment(startDate, Formats.DATE_FORMAT);
    const mEndDate = moment(endDate, Formats.DATE_FORMAT);

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1">
          <Form layout="horizontal" onSubmit={this.handleSubmit}>
            <SelectField
              data={[
                {
                  value: 'IPT',
                  text: 'IPT',
                },
                {
                  value: 'OPT',
                  text: 'OPT',
                },
              ]}
              getDataValue={({ value }) => value}
              getDataText={({ text }) => text}
              initialValue={paymentType}
              fieldName="paymentType"
              fieldLabel="Payment Type"
              fieldLayout={formItemLayout}
              getFieldDecorator={getFieldDecorator}
            />

            <InputTextField
              fieldName="name"
              fieldLabel="Name"
              fieldLayout={formItemLayout}
              initialValue={name}
              getFieldDecorator={getFieldDecorator}
            />

            <InputCnicField
              fieldName="cnicNumber"
              fieldLabel="CNIC Number"
              fieldLayout={formItemLayout}
              // initialValue={cnicNumber}
              getFieldDecorator={getFieldDecorator}
            />

            <InputNumberField
              fieldName="paymentAmount"
              fieldLabel="Payment Amount"
              fieldLayout={formItemLayout}
              initialValue={paymentAmount}
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
