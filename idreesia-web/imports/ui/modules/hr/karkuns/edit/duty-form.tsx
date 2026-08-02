import React from 'react';
import { Form } from 'antd';
import type { FormInstance } from 'antd/es/form';

import {
  CascaderField,
  SelectField,
  WeekDaysField,
} from '/imports/ui/modules/helpers/fields';
import { getDutyShiftCascaderData } from '/imports/ui/modules/hr/common/utilities';
import allDutyRoles from '../../all-duty_roles';
import type {
  ComposerAllDutyLocationsQuery,
  ComposerAllMsDutiesQuery,
  AllDutyShiftsQuery,
  KarkunDutiesByKarkunIdQuery,
} from 'meteor/idreesia-common/types/client-operations';

type MSDuty = NonNullable<NonNullable<ComposerAllMsDutiesQuery['allMSDuties']>[number]>;
type DutyShift = NonNullable<NonNullable<AllDutyShiftsQuery['allDutyShifts']>[number]>;
type DutyLocation = NonNullable<NonNullable<ComposerAllDutyLocationsQuery['allDutyLocations']>[number]>;
type KarkunDuty = NonNullable<NonNullable<KarkunDutiesByKarkunIdQuery['karkunDutiesByKarkunId']>[number]>;
type DutyDefaults = Partial<KarkunDuty> & { locationId?: string | null };

interface Props {
  form?: FormInstance;
  defaultValues?: DutyDefaults;
  allMSDuties?: Array<MSDuty | null> | null;
  allDutyShifts?: Array<DutyShift | null> | null;
  allDutyLocations?: Array<DutyLocation | null> | null;
}

const DutyForm = (props: Props) => {
  const {
    form,
    defaultValues = {},
    allMSDuties = [],
    allDutyShifts = [],
    allDutyLocations = [],
  } = props;
  const duties = (allMSDuties ?? []).filter((duty): duty is MSDuty => duty != null);
  const shifts = (allDutyShifts ?? []).filter((shift): shift is DutyShift => shift != null);
  const locations = (allDutyLocations ?? []).filter((location): location is DutyLocation => location != null);
  const dutyShiftCascaderData = getDutyShiftCascaderData(duties, shifts);

  return (
    <Form form={form} layout="horizontal">
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
        fieldName="role"
        fieldLabel="Role"
        allowClear={false}
        required
        initialValue={defaultValues.role || 'Member'}
      />

      <SelectField<DutyLocation>
        data={locations}
        fieldName="locationId"
        fieldLabel="Location Name"
        required={false}
        initialValue={defaultValues.locationId}
      />

      <WeekDaysField
        fieldName="weekDays"
        fieldLabel="Week Days"
        required={false}
        initialValue={
          defaultValues.daysOfWeek
            ? defaultValues.daysOfWeek.filter((day): day is string => day != null)
            : []
        }
      />
    </Form>
  );
};

export default DutyForm;
