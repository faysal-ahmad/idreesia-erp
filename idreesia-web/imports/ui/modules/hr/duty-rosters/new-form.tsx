import React from 'react';
import { Form, type FormInstance } from 'antd';
import type { Dayjs } from 'dayjs';

import {
  DateField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';
import {
  useAllDutyLocations,
  useAllMSDuties,
} from '/imports/ui/modules/hr/common/hooks';

export interface RosterFormValues {
  dutyId: string;
  locationId: string;
  startDate: Dayjs;
  endDate?: Dayjs | null;
}

interface NewFormProps {
  form: FormInstance<RosterFormValues>;
  lockDutyLocation?: boolean;
  initialDutyId?: string;
  initialLocationId?: string;
}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const NewForm = ({
  form,
  lockDutyLocation = false,
  initialDutyId,
  initialLocationId,
}: NewFormProps) => {
  const { allMSDuties } = useAllMSDuties();
  const { allDutyLocations } = useAllDutyLocations();
  const watchedDutyId = Form.useWatch('dutyId', form);
  const dutyId = watchedDutyId || initialDutyId;

  const duties = (allMSDuties ?? []).filter(
    (duty): duty is { _id: string; name: string } =>
      duty?._id != null && duty.name != null
  );
  const locations = (allDutyLocations ?? []).filter(
    (location): location is { _id: string; dutyId: string; name: string } =>
      location?._id != null &&
      location.name != null &&
      location.dutyId === dutyId
  );

  return (
    <Form form={form} layout="horizontal" preserve={false}>
      <SelectField
        data={duties}
        fieldName="dutyId"
        fieldLabel="Duty"
        fieldLayout={formItemLayout}
        placeholder="Select a duty"
        allowClear={false}
        disabled={lockDutyLocation}
        initialValue={lockDutyLocation ? initialDutyId ?? null : null}
        required
        requiredMessage="Please select a duty."
        onChange={() => form.setFieldValue('locationId', undefined)}
      />
      <SelectField
        data={locations}
        fieldName="locationId"
        fieldLabel="Location"
        fieldLayout={formItemLayout}
        placeholder="Select a location"
        allowClear={false}
        disabled={lockDutyLocation}
        initialValue={lockDutyLocation ? initialLocationId ?? null : null}
        required
        requiredMessage="Please select a location."
      />
      <DateField
        fieldName="startDate"
        fieldLabel="Start Date"
        fieldLayout={formItemLayout}
        required
        requiredMessage="Please select a start date."
      />
      <DateField
        fieldName="endDate"
        fieldLabel="End Date"
        fieldLayout={formItemLayout}
        allowClear
      />
    </Form>
  );
};

export default NewForm;
