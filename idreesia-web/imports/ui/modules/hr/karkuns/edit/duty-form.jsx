import React from 'react';
import PropTypes from 'prop-types';

import { Form } from '/imports/ui/controls';
import {
  CascaderField,
  SelectField,
  WeekDaysField,
} from '/imports/ui/modules/helpers/fields';
import { getDutyShiftCascaderData } from '/imports/ui/modules/hr/common/utilities';
import allDutyRoles from '../../all-duty_roles';

const DutyForm = props => {
  const { getFieldDecorator } = props.form;
  const { defaultValues, allDuties, allDutyShifts } = props;
  const dutyShiftCascaderData = getDutyShiftCascaderData(
    allDuties,
    allDutyShifts
  );

  return (
    <Form layout="horizontal">
      <CascaderField
        data={dutyShiftCascaderData}
        fieldName="dutyIdShiftId"
        fieldLabel="Duty/Shift"
        initialValue={[defaultValues.dutyId, defaultValues.shiftId]}
        required
        requiredMessage="Please select a duty/shift from the list."
        getFieldDecorator={getFieldDecorator}
      />

      <SelectField
        data={allDutyRoles}
        getDataValue={({ _id }) => _id}
        getDataText={({ name }) => name}
        fieldName="role"
        fieldLabel="Role"
        allowClear={false}
        required
        initialValue={defaultValues.role || 'Member'}
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
};

export default Form.create()(DutyForm);
