import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';

import {
  CascaderField,
  SelectField,
  WeekDaysField,
} from '/imports/ui/modules/helpers/fields';
import { getDutyShiftCascaderData } from '/imports/ui/modules/hr/common/utilities';
import allDutyRoles from '../../all-duty_roles';

const DutyForm = props => {
  const { defaultValues, allMSDuties, allDutyShifts, allDutyLocations } = props;
  const dutyShiftCascaderData = getDutyShiftCascaderData(
    allMSDuties,
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
      />

      <SelectField
        data={allDutyLocations}
        getDataValue={({ _id }) => _id}
        getDataText={({ name }) => name}
        fieldName="locationId"
        fieldLabel="Location Name"
        required={false}
        initialValue={defaultValues.locationId}
      />

      <WeekDaysField
        fieldName="weekDays"
        fieldLabel="Week Days"
        required={false}
        initialValue={defaultValues.daysOfWeek ? defaultValues.daysOfWeek : []}
      />
    </Form>
  );
};

DutyForm.propTypes = {
  form: PropTypes.object,
  defaultValues: PropTypes.object,
  allMSDuties: PropTypes.array,
  allDutyShifts: PropTypes.array,
  allDutyLocations: PropTypes.array,
};

export default DutyForm;
