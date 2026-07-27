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

const AntForm = Form as any;
const CascaderInputField = CascaderField as any;
const SelectInputField = SelectField as any;
const WeekDaysInputField = WeekDaysField as any;
type AnyRecord = Record<string, any>;
interface Props { form?: unknown; defaultValues?: AnyRecord; allMSDuties?: AnyRecord[]; allDutyShifts?: AnyRecord[]; allDutyLocations?: AnyRecord[]; }

const DutyForm = (props: Props) => {
  const { form, defaultValues = {}, allMSDuties = [], allDutyShifts = [], allDutyLocations = [] } = props;
  const dutyShiftCascaderData = getDutyShiftCascaderData(
    allMSDuties as any,
    allDutyShifts as any
  );

  return (
    <AntForm form={form} layout="horizontal">
      <CascaderInputField
        data={dutyShiftCascaderData}
        fieldName="dutyIdShiftId"
        fieldLabel="Duty/Shift"
        initialValue={[defaultValues.dutyId, defaultValues.shiftId]}
        required
        requiredMessage="Please select a duty/shift from the list."
      />

      <SelectInputField
        data={allDutyRoles}
        getDataValue={({ _id }: AnyRecord) => _id}
        getDataText={({ name }: AnyRecord) => name}
        fieldName="role"
        fieldLabel="Role"
        allowClear={false}
        required
        initialValue={defaultValues.role || 'Member'}
      />

      <SelectInputField
        data={allDutyLocations}
        getDataValue={({ _id }: AnyRecord) => _id}
        getDataText={({ name }: AnyRecord) => name}
        fieldName="locationId"
        fieldLabel="Location Name"
        required={false}
        initialValue={defaultValues.locationId}
      />

      <WeekDaysInputField
        fieldName="weekDays"
        fieldLabel="Week Days"
        required={false}
        initialValue={defaultValues.daysOfWeek ? defaultValues.daysOfWeek : []}
      />
    </AntForm>
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
