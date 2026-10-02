import React, { useEffect } from 'react';
import { Form } from 'antd';
import type { FormInstance } from 'antd/es/form';

import {
  CascaderField,
  SelectField,
  WeekDaysField,
} from '/imports/ui/modules/helpers/fields';
import { getDutyShiftCascaderData } from '/imports/ui/modules/hr/common/utilities';
import type {
  ComposerAllDutyLocationsQuery,
  ComposerAllMsDutiesQuery,
  AllDutyShiftsQuery,
  KarkunDutiesByKarkunIdQuery,
} from 'meteor/idreesia-common/types/client-operations';
import allDutyRoles from '../../all-duty_roles';

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
  const watchedDutyShift = Form.useWatch('dutyIdShiftId', form) as
    | Array<string | null | undefined>
    | undefined;
  const selectedDutyId = Array.isArray(watchedDutyShift)
    ? watchedDutyShift[0] ?? undefined
    : defaultValues.dutyId ?? undefined;
  const locationsForDuty = selectedDutyId
    ? locations.filter(location => location.dutyId === selectedDutyId)
    : [];

  useEffect(() => {
    if (!form || allDutyLocations == null || !selectedDutyId) return;
    const currentLocationId = form.getFieldValue('locationId') as
      | string
      | undefined;
    if (!currentLocationId) return;
    const belongsToDuty = allDutyLocations.some(
      location =>
        location != null &&
        location._id === currentLocationId &&
        location.dutyId === selectedDutyId
    );
    if (!belongsToDuty) {
      form.setFieldValue('locationId', undefined);
    }
  }, [form, allDutyLocations, selectedDutyId]);

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
        data={locationsForDuty}
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
