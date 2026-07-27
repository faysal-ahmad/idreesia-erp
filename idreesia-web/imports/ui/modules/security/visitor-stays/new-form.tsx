import React from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  AutoCompleteField,
  CascaderField,
  InputNumberField,
  SelectField,
  FormButtonsSubmit,
} from '/imports/ui/modules/helpers/fields';

import {
  WithAllMSDuties,
  WithAllDutyShifts,
} from '/imports/ui/modules/hr/common/composers';
import { StayReasons } from 'meteor/idreesia-common/constants/security';
import { WithDistinctStayAllowedBy } from 'meteor/idreesia-common/composers/security';
import { getDutyShiftCascaderData } from '/imports/ui/modules/hr/common/utilities';

const AntForm = Form as any;
const AutoComplete = AutoCompleteField as any;
const Cascader = CascaderField as any;
const NumberField = InputNumberField as any;
const DropdownField = SelectField as any;
const SubmitButtons = FormButtonsSubmit as any;
interface SelectOption { _id?: string; name?: string; }
interface VisitorStay { _id: string; }
interface NewFormValues { numOfDays: number; stayReason?: string; stayAllowedBy?: string; dutyIdShiftId?: string[]; }
interface NewFormProps {
  visitorId: string;
  handleAddItem?(visitorStay: VisitorStay): void;
  allMSDutiesLoading?: boolean;
  allDutyShiftsLoading?: boolean;
  distinctStayAllowedByLoading?: boolean;
  allMSDuties?: any[];
  allDutyShifts?: any[];
  distinctStayAllowedBy?: string[];
}

const NewForm = ({
  visitorId,
  handleAddItem,
  allMSDutiesLoading,
  allDutyShiftsLoading,
  distinctStayAllowedByLoading,
  allMSDuties,
  allDutyShifts,
  distinctStayAllowedBy,
}: NewFormProps) => {
  const [createVisitorStay] = useMutation(formMutation as any, {
    refetchQueries: ['pagedVisitorStays'],
  });

  const handleFinish = ({ numOfDays, stayReason, stayAllowedBy, dutyIdShiftId }: NewFormValues) => {
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
      .then(({ data }: any) => {
        const newVisitorStay = data?.createVisitorStay;
        if (handleAddItem) handleAddItem(newVisitorStay);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (
    allMSDutiesLoading ||
    allDutyShiftsLoading ||
    distinctStayAllowedByLoading
  )
    return null;

  const dutyShiftCascaderData = getDutyShiftCascaderData(
    (allMSDuties ?? []) as any,
    (allDutyShifts ?? []) as any
  );

  return (
    <AntForm layout="horizontal" onFinish={handleFinish}>
      <NumberField
        fieldName="numOfDays"
        fieldLabel="Num of Days"
        initialValue={1}
        minValue={1}
      />
      <AutoComplete
        fieldName="stayAllowedBy"
        fieldLabel="Stay Allowed By"
        dataSource={distinctStayAllowedBy}
      />
      <DropdownField
        data={StayReasons}
        getDataValue={({ _id }: SelectOption) => _id}
        getDataText={({ name }: SelectOption) => name}
        fieldName="stayReason"
        fieldLabel="Stay Reason"
      />
      <Cascader
        data={dutyShiftCascaderData}
        changeOnSelect={false}
        fieldName="dutyIdShiftId"
        fieldLabel="Duty Participation"
      />

      <SubmitButtons
        text="Add Stay"
        isFieldsTouched
      />
    </AntForm>
  );
};

const formMutation = gql`
  mutation createVisitorStay(
    $visitorId: String!
    $numOfDays: Float!
    $stayReason: String
    $stayAllowedBy: String
    $dutyId: String
    $shiftId: String
  ) {
    createVisitorStay(
      visitorId: $visitorId
      numOfDays: $numOfDays
      stayReason: $stayReason
      stayAllowedBy: $stayAllowedBy
      dutyId: $dutyId
      shiftId: $shiftId
    ) {
      _id
      visitorId
      fromDate
      toDate
      stayReason
      stayAllowedBy
      dutyId
      shiftId
    }
  }
`;

NewForm.propTypes = {
  visitorId: PropTypes.string,
  handleAddItem: PropTypes.func,
  allMSDuties: PropTypes.array,
  allMSDutiesLoading: PropTypes.bool,
  allDutyShifts: PropTypes.array,
  allDutyShiftsLoading: PropTypes.bool,
  distinctStayAllowedBy: PropTypes.array,
  distinctStayAllowedByLoading: PropTypes.bool,
};

export default flowRight(
  WithAllMSDuties(),
  WithAllDutyShifts(),
  WithDistinctStayAllowedBy()
)(NewForm as any);
