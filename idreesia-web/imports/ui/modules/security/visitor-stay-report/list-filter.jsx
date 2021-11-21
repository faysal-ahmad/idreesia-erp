import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Formats } from 'meteor/idreesia-common/constants';
import { StayReasons } from 'meteor/idreesia-common/constants/security';
import { Collapse, Form, Row, Button } from '/imports/ui/controls';
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
    form: PropTypes.object,
    setPageParams: PropTypes.func,
    queryParams: PropTypes.object,

    distinctCitiesLoading: PropTypes.bool,
    distinctCities: PropTypes.array,
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, setPageParams } = this.props;

    form.validateFields(
      (err, { startDate, endDate, name, city, stayReason, additionalInfo }) => {
        if (err) return;
        setPageParams({
          startDate,
          endDate,
          name,
          city,
          stayReason,
          additionalInfo,
          pageIndex: 0,
        });
      }
    );
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

    const mStartDate = moment(startDate, Formats.DATE_FORMAT);
    const mEndDate = moment(endDate, Formats.DATE_FORMAT);

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1">
          <Form layout="horizontal" onSubmit={this.handleSubmit}>
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

export default flowRight(
  Form.create(),
  WithDistinctCities()
)(ListFilter);
