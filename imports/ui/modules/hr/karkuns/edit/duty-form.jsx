import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { merge } from 'react-komposer';
import { Form, Row, Col } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import {
  SelectField,
  TimeField,
  DateField,
  WeekDaysField,
  FormButtonsSaveCancel
} from '/imports/ui/modules/helpers/fields';

class DutyForm extends Component {
  static propTypes = {
    defaultValues: PropTypes.object,
    allDuties: PropTypes.array,
    allDutyLocations: PropTypes.array
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { defaultValues, allDuties, allDutyLocations } = this.props;

    return (
      <Form layout="horizontal">
        <SelectField
          data={allDuties}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="dutyId"
          fieldLabel="Duty Name"
          required={true}
          requiredMessage="Please select a duty from the list."
          initialValue={defaultValues.dutyId}
          getFieldDecorator={getFieldDecorator}
        />

        <SelectField
          data={allDutyLocations}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="locationId"
          fieldLabel="Location Name"
          required={false}
          initialValue={defaultValues.locationId}
          getFieldDecorator={getFieldDecorator}
        />

        <TimeField
          fieldName="startTime"
          fieldLabel="Start Time"
          required={true}
          requiredMessage="Please input start time for the duty."
          initialValue={defaultValues.startTime ? moment(defaultValues.startTime) : null}
          getFieldDecorator={getFieldDecorator}
        />

        <TimeField
          fieldName="endTime"
          fieldLabel="End Time"
          required={true}
          requiredMessage="Please input end time for the duty."
          initialValue={defaultValues.endTime ? moment(defaultValues.endTime) : null}
          getFieldDecorator={getFieldDecorator}
        />

        <DateField
          fieldName="startDate"
          fieldLabel="Start Date"
          required={false}
          initialValue={defaultValues.startDate ? moment(defaultValues.startDate) : null}
          getFieldDecorator={getFieldDecorator}
        />

        <DateField
          fieldName="endDate"
          fieldLabel="End Date"
          required={false}
          initialValue={defaultValues.endDate ? moment(defaultValues.endDate) : null}
          getFieldDecorator={getFieldDecorator}
        />

        <WeekDaysField
          fieldName="weekDays"
          fieldLabel="Week Days"
          required={false}
          initialValue={defaultValues.daysOfWeek ? defaultValues.daysOfWeek : []}
          getFieldDecorator={getFieldDecorator}
        />
      </Form>
    );
  }
}

export default Form.create()(DutyForm);
