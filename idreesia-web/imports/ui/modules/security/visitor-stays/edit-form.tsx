import React, { useState } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useQuery, useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';
import dayjs from 'dayjs';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  AutoCompleteField,
  CascaderField,
  DateField,
  SelectField,
  FormButtonsSubmit,
} from '/imports/ui/modules/helpers/fields';

import { StayReasons } from 'meteor/idreesia-common/constants/security';
import { WithDistinctStayAllowedBy } from 'meteor/idreesia-common/composers/security';
import {
  WithAllMSDuties,
  WithAllDutyShifts,
} from '/imports/ui/modules/hr/common/composers';
import { getDutyShiftCascaderData } from '/imports/ui/modules/hr/common/utilities';

const AntForm = Form as any;
const AutoComplete = AutoCompleteField as any;
const Cascader = CascaderField as any;
const FormDateField = DateField as any;
const DropdownField = SelectField as any;
const SubmitButtons = FormButtonsSubmit as any;
interface SelectOption { _id?: string; name?: string; }
interface VisitorStay { _id: string; fromDate: string | number; toDate: string | number; stayReason?: string; stayAllowedBy?: string; dutyId?: string; shiftId?: string; }
interface EditFormValues { fromDate: string | number | Date; toDate: string | number | Date; stayReason?: string; stayAllowedBy?: string; dutyIdShiftId?: string[]; }
interface EditFormProps {
  visitorStayId?: string;
  handleSaveItem?(): void;
  formDataLoading?: boolean;
  visitorStayById?: VisitorStay | null;
  allMSDutiesLoading?: boolean;
  allDutyShiftsLoading?: boolean;
  distinctStayAllowedByLoading?: boolean;
  allMSDuties?: any[];
  allDutyShifts?: any[];
  distinctStayAllowedBy?: string[];
}
interface VisitorStayData { visitorStayById?: VisitorStay | null; }

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
  const [updateVisitorStay] = useMutation(formMutation as any, {
    refetchQueries: ['pagedVisitorStays'],
  });

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ fromDate, toDate, stayReason, stayAllowedBy, dutyIdShiftId }: EditFormValues) => {
    if (!visitorStayById) return;
    updateVisitorStay({
      variables: {
        _id: visitorStayById._id,
        fromDate,
        toDate,
        stayReason: stayReason || null,
        stayAllowedBy,
        dutyId: dutyIdShiftId ? dutyIdShiftId[0] : null,
        shiftId: dutyIdShiftId ? dutyIdShiftId[1] : null,
      },
    })
      .then(() => {
        if (handleSaveItem) handleSaveItem();
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
  )
    return null;
  if (!visitorStayById) return null;

  const dutyShiftCascaderData = getDutyShiftCascaderData(
    (allMSDuties ?? []) as any,
    (allDutyShifts ?? []) as any
  );

  return (
    <AntForm layout="horizontal"  onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <FormDateField
        fieldName="fromDate"
        fieldLabel="From Date"
        initialValue={dayjs(Number(visitorStayById.fromDate))}
        required
        requiredMessage="Please select from date."
      />
      <FormDateField
        fieldName="toDate"
        fieldLabel="To Date"
        initialValue={dayjs(Number(visitorStayById.toDate))}
        required
        requiredMessage="Please select to date."
      />
      <AutoComplete
        fieldName="stayAllowedBy"
        fieldLabel="Stay Allowed By"
        dataSource={distinctStayAllowedBy}
        initialValue={visitorStayById.stayAllowedBy}
      />
      <DropdownField
        data={StayReasons}
        getDataValue={({ _id }: SelectOption) => _id}
        getDataText={({ name }: SelectOption) => name}
        fieldName="stayReason"
        fieldLabel="Stay Reason"
        initialValue={visitorStayById.stayReason}
      />
      <Cascader
        data={dutyShiftCascaderData}
        changeOnSelect={false}
        fieldName="dutyIdShiftId"
        fieldLabel="Duty Participation"
        initialValue={[visitorStayById.dutyId, visitorStayById.shiftId]}
      />

      <SubmitButtons
        text="Update Stay"
        isFieldsTouched={isFieldsTouched}
      />
    </AntForm>
  );
};

const formQuery = gql`
  query editVisitorStayById($_id: String!) {
    visitorStayById(_id: $_id) {
      _id
      visitorId
      fromDate
      toDate
      numOfDays
      stayReason
      stayAllowedBy
      dutyId
      shiftId
    }
  }
`;

const formMutation = gql`
  mutation updateVisitorStay(
    $_id: String!
    $fromDate: String!
    $toDate: String!
    $stayReason: String
    $stayAllowedBy: String
    $dutyId: String
    $shiftId: String
  ) {
    updateVisitorStay(
      _id: $_id
      fromDate: $fromDate
      toDate: $toDate
      stayReason: $stayReason
      stayAllowedBy: $stayAllowedBy
      dutyId: $dutyId
      shiftId: $shiftId
    ) {
      _id
      visitorId
      fromDate
      toDate
      numOfDays
      stayReason
      stayAllowedBy
      dutyId
      shiftId
    }
  }
`;

const EditFormWithData = (props: EditFormProps) => {
  const { visitorStayId } = props;
  const { data = {}, loading, ...queryResult } = useQuery(formQuery as any, {
    variables: { _id: visitorStayId },
  });

  return (
    <EditForm
      {...props}
      {...queryResult}
      {...(data as VisitorStayData)}
      formDataLoading={loading}
    />
  );
};

EditForm.propTypes = {
  visitorStayId: PropTypes.string,
  handleSaveItem: PropTypes.func,
  formDataLoading: PropTypes.bool,
  visitorStayById: PropTypes.object,
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
)(EditFormWithData as any);
