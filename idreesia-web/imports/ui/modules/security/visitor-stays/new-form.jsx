import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
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
import {
  WithDistinctTeamNames,
  WithDistinctStayAllowedBy,
} from 'meteor/idreesia-common/composers/security';
import { getDutyShiftCascaderData } from '/imports/ui/modules/hr/common/utilities';

class NewForm extends Component {
  static propTypes = {
    form: PropTypes.object,
    visitorId: PropTypes.string,
    handleAddItem: PropTypes.func,
    createVisitorStay: PropTypes.func,

    allMSDuties: PropTypes.array,
    allMSDutiesLoading: PropTypes.bool,
    allDutyShifts: PropTypes.array,
    allDutyShiftsLoading: PropTypes.bool,
    distinctStayAllowedBy: PropTypes.array,
    distinctStayAllowedByLoading: PropTypes.bool,
    distinctTeamNames: PropTypes.array,
    distinctTeamNamesLoading: PropTypes.bool,
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, visitorId, handleAddItem, createVisitorStay } = this.props;
    form.validateFields(
      (
        err,
        { numOfDays, stayReason, stayAllowedBy, dutyIdShiftId, teamName }
      ) => {
        if (err) return;

        createVisitorStay({
          variables: {
            visitorId,
            numOfDays,
            stayReason,
            stayAllowedBy,
            dutyId: dutyIdShiftId ? dutyIdShiftId[0] : null,
            shiftId: dutyIdShiftId ? dutyIdShiftId[1] : null,
            teamName,
          },
        })
          .then(({ data: { createVisitorStay: newVisitorStay } }) => {
            if (handleAddItem) handleAddItem(newVisitorStay);
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const {
      allMSDutiesLoading,
      allDutyShiftsLoading,
      distinctStayAllowedByLoading,
      distinctTeamNamesLoading,
      allMSDuties,
      allDutyShifts,
      distinctStayAllowedBy,
      distinctTeamNames,
    } = this.props;

    if (
      allMSDutiesLoading ||
      allDutyShiftsLoading ||
      distinctStayAllowedByLoading ||
      distinctTeamNamesLoading
    )
      return null;

    const dutyShiftCascaderData = getDutyShiftCascaderData(
      allMSDuties,
      allDutyShifts
    );

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
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
        <AutoCompleteField
          fieldName="teamName"
          fieldLabel="Team Name"
          dataSource={distinctTeamNames}
        />

        <FormButtonsSubmit text="Add Stay" />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createVisitorStay(
    $visitorId: String!
    $numOfDays: Float!
    $stayReason: String
    $stayAllowedBy: String
    $dutyId: String
    $shiftId: String
    $teamName: String
  ) {
    createVisitorStay(
      visitorId: $visitorId
      numOfDays: $numOfDays
      stayReason: $stayReason
      stayAllowedBy: $stayAllowedBy
      dutyId: $dutyId
      shiftId: $shiftId
      teamName: $teamName
    ) {
      _id
      visitorId
      fromDate
      toDate
      stayReason
      stayAllowedBy
      dutyId
      shiftId
      teamName
    }
  }
`;

export default flowRight(
  graphql(formMutation, {
    name: 'createVisitorStay',
    options: {
      refetchQueries: ['pagedVisitorStays'],
    },
  }),
  WithAllMSDuties(),
  WithAllDutyShifts(),
  WithDistinctStayAllowedBy(),
  WithDistinctTeamNames()
)(NewForm);
