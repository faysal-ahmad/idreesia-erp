import React from "react";
import PropTypes from "prop-types";
import { Form } from "antd";

import { SelectField, WeekDaysField } from "/imports/ui/modules/helpers/fields";

import allDutyRoles from "../../all-duty_roles";

const DutyForm = props => {
  const { getFieldDecorator } = props.form;
  const { defaultValues, allDuties, allDutyShifts, allDutyLocations } = props;

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
        data={allDutyShifts}
        getDataValue={({ _id }) => _id}
        getDataText={({ name }) => name}
        fieldName="shiftId"
        fieldLabel="Shift Name"
        required={false}
        initialValue={defaultValues.shiftId}
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

      <SelectField
        data={allDutyRoles}
        getDataValue={({ _id }) => _id}
        getDataText={({ name }) => name}
        fieldName="role"
        fieldLabel="Role"
        required={false}
        initialValue={defaultValues.role}
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
  allDutyShifts: PropTypes.array,
  allDutyLocations: PropTypes.array,
};

export default Form.create()(DutyForm);
