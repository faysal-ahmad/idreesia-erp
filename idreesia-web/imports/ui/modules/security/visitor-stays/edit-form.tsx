import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';
import dayjs, { type Dayjs } from 'dayjs';

import { useDistinctStayAllowedBy } from 'meteor/idreesia-common/hooks/security';
import {
  useAllMSDuties,
  useAllDutyShifts,
} from '/imports/ui/modules/hr/common/hooks';
import type {
  AllDutyShiftsQuery,
  ComposerAllMsDutiesQuery,
  EditVisitorStayByIdQuery,
} from 'meteor/idreesia-common/types/client-operations';
import {
  AutoCompleteField,
  CascaderField,
  DateField,
  SelectField,
  FormButtonsSubmit,
} from '/imports/ui/modules/helpers/fields';

import { StayReasons } from 'meteor/idreesia-common/constants/security';
import { getDutyShiftCascaderData } from '/imports/ui/modules/hr/common/utilities';

import { EDIT_VISITOR_STAY_BY_ID, UPDATE_VISITOR_STAY } from './gql';

type MSDuty = NonNullable<NonNullable<ComposerAllMsDutiesQuery['allMSDuties']>[number]>;
type DutyShift = NonNullable<NonNullable<AllDutyShiftsQuery['allDutyShifts']>[number]>;
type VisitorStay = NonNullable<EditVisitorStayByIdQuery['visitorStayById']>;

interface EditFormValues {
  fromDate: Dayjs;
  toDate: Dayjs;
  stayReason?: string;
  stayAllowedBy?: string;
  dutyIdShiftId?: string[];
}

interface EditFormProps {
  visitorStayId: string;
  handleSaveItem?(): void;
  formDataLoading?: boolean;
  visitorStayById?: VisitorStay | null;
  allMSDuties?: Array<MSDuty | null> | null;
  allMSDutiesLoading?: boolean;
  allDutyShifts?: Array<DutyShift | null> | null;
  allDutyShiftsLoading?: boolean;
  distinctStayAllowedBy?: string[] | null;
  distinctStayAllowedByLoading?: boolean;
}

const EditForm = ({
  handleSaveItem,
  formDataLoading,
  visitorStayById,
  allMSDutiesLoading,
  allDutyShiftsLoading,
  distinctStayAllowedByLoading,
  allMSDuties,
  allDutyShifts,
  distinctStayAllowedBy,
}: EditFormProps) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [updateVisitorStay] = useMutation(UPDATE_VISITOR_STAY, {
    refetchQueries: ['pagedVisitorStays'],
  });

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({
    fromDate,
    toDate,
    stayReason,
    stayAllowedBy,
    dutyIdShiftId,
  }: EditFormValues) => {
    if (!visitorStayById?._id) return;
    updateVisitorStay({
      variables: {
        _id: visitorStayById._id,
        fromDate: fromDate as unknown as string,
        toDate: toDate as unknown as string,
        stayReason: stayReason || null,
        stayAllowedBy,
        dutyId: dutyIdShiftId ? dutyIdShiftId[0] : null,
        shiftId: dutyIdShiftId ? dutyIdShiftId[1] : null,
      },
    })
      .then(() => {
        handleSaveItem?.();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (
    formDataLoading ||
    allMSDutiesLoading ||
    allDutyShiftsLoading ||
    distinctStayAllowedByLoading
  ) {
    return null;
  }
  if (!visitorStayById) return null;

  const duties = (allMSDuties ?? []).filter((duty): duty is MSDuty => duty != null);
  const shifts = (allDutyShifts ?? []).filter((shift): shift is DutyShift => shift != null);
  const dutyShiftCascaderData = getDutyShiftCascaderData(duties, shifts);

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <DateField
        fieldName="fromDate"
        fieldLabel="From Date"
        initialValue={dayjs(Number(visitorStayById.fromDate))}
        required
        requiredMessage="Please select from date."
      />
      <DateField
        fieldName="toDate"
        fieldLabel="To Date"
        initialValue={dayjs(Number(visitorStayById.toDate))}
        required
        requiredMessage="Please select to date."
      />
      <AutoCompleteField
        fieldName="stayAllowedBy"
        fieldLabel="Stay Allowed By"
        dataSource={distinctStayAllowedBy ?? undefined}
        initialValue={visitorStayById.stayAllowedBy}
      />
      <SelectField
        data={StayReasons}
        getDataValue={({ _id }) => _id}
        getDataText={({ name }) => name}
        fieldName="stayReason"
        fieldLabel="Stay Reason"
        initialValue={visitorStayById.stayReason}
      />
      <CascaderField
        data={dutyShiftCascaderData}
        changeOnSelect={false}
        fieldName="dutyIdShiftId"
        fieldLabel="Duty Participation"
        initialValue={[visitorStayById.dutyId, visitorStayById.shiftId].filter(
          (value): value is string => value != null
        )}
      />

      <FormButtonsSubmit
        text="Update Stay"
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

interface EditFormWithDataProps {
  visitorStayId: string;
  handleSaveItem?(): void;
}

const EditFormWithData = ({ visitorStayId, handleSaveItem }: EditFormWithDataProps) => {
  const { allMSDuties, allMSDutiesLoading } = useAllMSDuties();
  const { allDutyShifts, allDutyShiftsLoading } = useAllDutyShifts();
  const { distinctStayAllowedBy, distinctStayAllowedByLoading } =
    useDistinctStayAllowedBy();
  const { data, loading } = useQuery(EDIT_VISITOR_STAY_BY_ID, {
    variables: { _id: visitorStayId },
  });

  return (
    <EditForm
      visitorStayId={visitorStayId}
      handleSaveItem={handleSaveItem}
      formDataLoading={loading}
      visitorStayById={data?.visitorStayById}
      allMSDuties={allMSDuties}
      allMSDutiesLoading={allMSDutiesLoading}
      allDutyShifts={allDutyShifts}
      allDutyShiftsLoading={allDutyShiftsLoading}
      distinctStayAllowedBy={distinctStayAllowedBy}
      distinctStayAllowedByLoading={distinctStayAllowedByLoading}
    />
  );
};

export default EditFormWithData;
