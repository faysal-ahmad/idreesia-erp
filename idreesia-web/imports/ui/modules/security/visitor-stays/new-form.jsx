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

const NewForm = ({
  visitorId,
  handleAddItem,
  allMSDutiesLoading,
  allDutyShiftsLoading,
  distinctStayAllowedByLoading,
  allMSDuties,
  allDutyShifts,
  distinctStayAllowedBy,
}) => {
  const [createVisitorStay] = useMutation(formMutation, {
    refetchQueries: ['pagedVisitorStays'],
  });

  const handleFinish = ({ numOfDays, stayReason, stayAllowedBy, dutyIdShiftId }) => {
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
      .then(({ data: { createVisitorStay: newVisitorStay } }) => {
        if (handleAddItem) handleAddItem(newVisitorStay);
      })
      .catch(error => {
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
    allMSDuties,
    allDutyShifts
  );

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
        dataSource={distinctStayAllowedBy}
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
)(NewForm);
