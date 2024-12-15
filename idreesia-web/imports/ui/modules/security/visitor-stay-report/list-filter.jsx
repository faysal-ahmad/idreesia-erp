import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Collapse, Form, Row, Button } from 'antd';

import { Formats } from 'meteor/idreesia-common/constants';
import { StayReasons } from 'meteor/idreesia-common/constants/security';
import {
  AutoCompleteField,
  InputTextField,
  DateField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';

import { WithDistinctCities } from 'meteor/idreesia-common/composers/security';

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
    setPageParams: PropTypes.func,
    queryParams: PropTypes.object,

    distinctCitiesLoading: PropTypes.bool,
    distinctCities: PropTypes.array,
  };

  handleFinish = ({ startDate, endDate, name, city, stayReason, additionalInfo }) => {
    const { setPageParams } = this.props;
    setPageParams({
      startDate: startDate ? dayjs(startDate).format(Formats.DATE_FORMAT) : null,
      endDate: endDate ? dayjs(endDate).format(Formats.DATE_FORMAT) : null,
      name,
      city,
      stayReason,
      additionalInfo,
      pageIndex: 0,
    });
  };

  handleReset = () => {
    const { setPageParams } = this.props;
    setPageParams({
      startDate: null,
      endDate: null,
      name: null,
      city: null,
      stayReason: null,
      additionalInfo: null,
      pageIndex: 0,
    });
  };

  render() {
    const {
      distinctCities,
      queryParams: {
        startDate,
        endDate,
        name,
        city,
        stayReason,
        additionalInfo,
      },
    } = this.props;

    const mStartDate = startDate ? dayjs(startDate, Formats.DATE_FORMAT) : null;
    const mEndDate = endDate ? dayjs(endDate, Formats.DATE_FORMAT) : null;

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1">
          <Form layout="horizontal" onFinish={this.handleFinish}>
            <DateField
              fieldName="startDate"
              fieldLabel="Start Date"
              fieldLayout={formItemLayout}
              required={false}
              initialValue={mStartDate}
            />
            <DateField
              fieldName="endDate"
              fieldLabel="End Date"
              fieldLayout={formItemLayout}
              required={false}
              initialValue={mEndDate}
            />
            <InputTextField
              fieldName="name"
              fieldLabel="Name"
              required={false}
              fieldLayout={formItemLayout}
              initialValue={name}
            />
            <AutoCompleteField
              fieldName="city"
              fieldLabel="City"
              fieldLayout={formItemLayout}
              dataSource={distinctCities}
              initialValue={city}
              required={false}
            />
            <SelectField
              data={StayReasons}
              getDataValue={({ _id }) => _id}
              getDataText={({ name: _name }) => _name}
              initialValue={stayReason}
              fieldName="stayReason"
              fieldLabel="Stay Reason"
              fieldLayout={formItemLayout}
            />
            <SelectField
              fieldName="additionalInfo"
              fieldLabel="Additional Info"
              required={false}
              data={[
                {
                  label: 'Has Associated Notes',
                  value: 'has-notes',
                },
                {
                  label: 'Has Crimial Record',
                  value: 'has-criminal-record',
                },
                {
                  label: 'Has Notes or Crimial Record',
                  value: 'has-notes-or-criminal-record',
                },
              ]}
              getDataValue={({ value }) => value}
              getDataText={({ label }) => label}
              initialValue={additionalInfo}
              fieldLayout={formItemLayout}
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

export default WithDistinctCities()(ListFilter);
