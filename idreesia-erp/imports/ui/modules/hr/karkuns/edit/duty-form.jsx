import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { Form } from "antd";

import {
  SelectField,
  TimeField,
  WeekDaysField,
} from "/imports/ui/modules/helpers/fields";

const DutyForm = props => {
  const { getFieldDecorator } = props.form;
  const { defaultValues, allDuties, allDutyLocations } = props;

  return (
    <Form layout="horizontal">
      <SelectField
        data={allDuties}
        getDataValue={({ _id }) => _id}
        getDataText={({ name }) => name}
        fieldName="dutyId"
        fieldLabel="Duty Name"
        required
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
        required
        requiredMessage="Please input start time for the duty."
        initialValue={
          defaultValues.startTime ? moment(defaultValues.startTime) : null
        }
        getFieldDecorator={getFieldDecorator}
      />

      <TimeField
        fieldName="endTime"
        fieldLabel="End Time"
        required
        requiredMessage="Please input end time for the duty."
        initialValue={
          defaultValues.endTime ? moment(defaultValues.endTime) : null
        }
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
};

DutyForm.propTypes = {
  form: PropTypes.object,
  defaultValues: PropTypes.object,
  allDuties: PropTypes.array,
  allDutyLocations: PropTypes.array,
};

export default Form.create()(DutyForm);
