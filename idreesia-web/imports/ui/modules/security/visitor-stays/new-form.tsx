import React from 'react';
import { useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';

import { useDistinctStayAllowedBy } from 'meteor/idreesia-common/hooks/security';
import {
  useAllMSDuties,
  useAllDutyShifts,
} from '/imports/ui/modules/hr/common/hooks';
import type {
  AllDutyShiftsQuery,
  ComposerAllMsDutiesQuery,
  CreateVisitorStayMutation,
} from 'meteor/idreesia-common/types/client-operations';
import {
  AutoCompleteField,
  CascaderField,
  InputNumberField,
  SelectField,
  FormButtonsSubmit,
} from '/imports/ui/modules/helpers/fields';

import { StayReasons } from 'meteor/idreesia-common/constants/security';
import { getDutyShiftCascaderData } from '/imports/ui/modules/hr/common/utilities';

import { CREATE_VISITOR_STAY } from './gql';

type MSDuty = NonNullable<NonNullable<ComposerAllMsDutiesQuery['allMSDuties']>[number]>;
type DutyShift = NonNullable<NonNullable<AllDutyShiftsQuery['allDutyShifts']>[number]>;
type VisitorStay = NonNullable<CreateVisitorStayMutation['createVisitorStay']>;

interface NewFormValues {
  numOfDays: number;
  stayReason?: string;
  stayAllowedBy?: string;
  dutyIdShiftId?: string[];
}

interface NewFormProps {
  visitorId: string;
  handleAddItem?(visitorStay: VisitorStay): void;
}

const NewForm = ({ visitorId, handleAddItem }: NewFormProps) => {
  const { allMSDuties, allMSDutiesLoading } = useAllMSDuties();
  const { allDutyShifts, allDutyShiftsLoading } = useAllDutyShifts();
  const { distinctStayAllowedBy, distinctStayAllowedByLoading } =
    useDistinctStayAllowedBy();
  const [createVisitorStay] = useMutation(CREATE_VISITOR_STAY, {
    refetchQueries: ['pagedVisitorStays'],
  });

  const handleFinish = ({
    numOfDays,
    stayReason,
    stayAllowedBy,
    dutyIdShiftId,
  }: NewFormValues) => {
    createVisitorStay({
      variables: {
        visitorId,
        numOfDays,
        stayReason,
        stayAllowedBy,
        dutyId: dutyIdShiftId ? dutyIdShiftId[0] : null,
        shiftId: dutyIdShiftId ? dutyIdShiftId[1] : null,
      },
    })
      .then(({ data }) => {
        const newVisitorStay = data?.createVisitorStay;
        if (newVisitorStay) {
          handleAddItem?.(newVisitorStay);
        }
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (
    allMSDutiesLoading ||
    allDutyShiftsLoading ||
    distinctStayAllowedByLoading
  ) {
    return null;
  }

  const duties = (allMSDuties ?? []).filter((duty): duty is MSDuty => duty != null);
  const shifts = (allDutyShifts ?? []).filter((shift): shift is DutyShift => shift != null);
  const dutyShiftCascaderData = getDutyShiftCascaderData(duties, shifts);

  return (
    <Form layout="horizontal" onFinish={handleFinish}>
      <InputNumberField
        fieldName="numOfDays"
        fieldLabel="Num of Days"
        initialValue={1}
        minValue={1}
      />
      <AutoCompleteField
        fieldName="stayAllowedBy"
        fieldLabel="Stay Allowed By"
        dataSource={distinctStayAllowedBy ?? undefined}
      />
      <SelectField
        data={StayReasons}
        getDataValue={({ _id }) => _id}
        getDataText={({ name }) => name}
        fieldName="stayReason"
        fieldLabel="Stay Reason"
      />
      <CascaderField
        data={dutyShiftCascaderData}
        changeOnSelect={false}
        fieldName="dutyIdShiftId"
        fieldLabel="Duty Participation"
      />

      <FormButtonsSubmit
        text="Add Stay"
        isFieldsTouched
      />
    </Form>
  );
};

export default NewForm;
