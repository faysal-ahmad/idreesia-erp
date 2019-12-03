import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

import { Form, message } from '/imports/ui/controls';
import {
  AutoCompleteField,
  CascaderField,
  InputNumberField,
  SelectField,
  FormButtonsSubmit,
} from '/imports/ui/modules/helpers/fields';

import {
  WithAllDuties,
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

    allDuties: PropTypes.array,
    allDutiesLoading: PropTypes.bool,
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
      allDutiesLoading,
      allDutyShiftsLoading,
      distinctStayAllowedByLoading,
      distinctTeamNamesLoading,
      allDuties,
      allDutyShifts,
      distinctStayAllowedBy,
      distinctTeamNames,
      form: { getFieldDecorator },
    } = this.props;

    if (
      allDutiesLoading ||
      allDutyShiftsLoading ||
      distinctStayAllowedByLoading ||
      distinctTeamNamesLoading
    )
      return null;

    const dutyShiftCascaderData = getDutyShiftCascaderData(
      allDuties,
      allDutyShifts
    );

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputNumberField
          fieldName="numOfDays"
          fieldLabel="Num of Days"
          initialValue={1}
          minValue={1}
          getFieldDecorator={getFieldDecorator}
        />
        <AutoCompleteField
          fieldName="stayAllowedBy"
          fieldLabel="Stay Allowed By"
          dataSource={distinctStayAllowedBy}
          getFieldDecorator={getFieldDecorator}
        />
        <SelectField
          data={StayReasons}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="stayReason"
          fieldLabel="Stay Reason"
          getFieldDecorator={getFieldDecorator}
        />
        <CascaderField
          data={dutyShiftCascaderData}
          changeOnSelect={false}
          fieldName="dutyIdShiftId"
          fieldLabel="Duty Participation"
          getFieldDecorator={getFieldDecorator}
        />
        <AutoCompleteField
          fieldName="teamName"
          fieldLabel="Team Name"
          dataSource={distinctTeamNames}
          getFieldDecorator={getFieldDecorator}
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
  Form.create(),
  graphql(formMutation, {
    name: 'createVisitorStay',
    options: {
      refetchQueries: ['pagedVisitorStays'],
    },
  }),
  WithAllDuties(),
  WithAllDutyShifts(),
  WithDistinctStayAllowedBy(),
  WithDistinctTeamNames()
)(NewForm);
