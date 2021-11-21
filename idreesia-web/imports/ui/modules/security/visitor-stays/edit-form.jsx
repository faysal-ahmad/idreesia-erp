import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import moment from 'moment';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Form, message } from '/imports/ui/controls';
import {
  AutoCompleteField,
  CascaderField,
  DateField,
  SelectField,
  FormButtonsSubmit,
} from '/imports/ui/modules/helpers/fields';

import { StayReasons } from 'meteor/idreesia-common/constants/security';
import {
  WithDistinctTeamNames,
  WithDistinctStayAllowedBy,
} from 'meteor/idreesia-common/composers/security';
import {
  WithAllMSDuties,
  WithAllDutyShifts,
} from '/imports/ui/modules/hr/common/composers';
import { getDutyShiftCascaderData } from '/imports/ui/modules/hr/common/utilities';

class EditForm extends Component {
  static propTypes = {
    form: PropTypes.object,
    visitorStayId: PropTypes.string,
    handleSaveItem: PropTypes.func,
    updateVisitorStay: PropTypes.func,

    formDataLoading: PropTypes.bool,
    visitorStayById: PropTypes.object,
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
    const {
      form,
      visitorStayById,
      handleSaveItem,
      updateVisitorStay,
    } = this.props;
    form.validateFields(
      (
        err,
        { fromDate, toDate, stayReason, stayAllowedBy, dutyIdShiftId, teamName }
      ) => {
        if (err) return;

        updateVisitorStay({
          variables: {
            _id: visitorStayById._id,
            fromDate,
            toDate,
            stayReason: stayReason || null,
            stayAllowedBy,
            dutyId: dutyIdShiftId ? dutyIdShiftId[0] : null,
            shiftId: dutyIdShiftId ? dutyIdShiftId[1] : null,
            teamName,
          },
        })
          .then(() => {
            if (handleSaveItem) handleSaveItem();
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const {
      formDataLoading,
      visitorStayById,
      allMSDutiesLoading,
      allDutyShiftsLoading,
      distinctStayAllowedByLoading,
      distinctTeamNamesLoading,
      allMSDuties,
      allDutyShifts,
      distinctStayAllowedBy,
      distinctTeamNames,
      form: { isFieldsTouched },
    } = this.props;

    if (
      formDataLoading ||
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
        <DateField
          fieldName="fromDate"
          fieldLabel="From Date"
          initialValue={moment(Number(visitorStayById.fromDate))}
          required
          requiredMessage="Please select a from date."
        />
        <DateField
          fieldName="toDate"
          fieldLabel="To Date"
          initialValue={moment(Number(visitorStayById.toDate))}
          required
          requiredMessage="Please select a to date."
        />
        <AutoCompleteField
          fieldName="stayAllowedBy"
          fieldLabel="Stay Allowed By"
          dataSource={distinctStayAllowedBy}
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
          initialValue={[visitorStayById.dutyId, visitorStayById.shiftId]}
        />
        <AutoCompleteField
          fieldName="teamName"
          fieldLabel="Team Name"
          dataSource={distinctTeamNames}
          initialValue={visitorStayById.teamName}
        />

        <FormButtonsSubmit
          text="Update Stay"
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

const formQuery = gql`
  query visitorStayById($_id: String!) {
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
      teamName
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
    $teamName: String
  ) {
    updateVisitorStay(
      _id: $_id
      fromDate: $fromDate
      toDate: $toDate
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
      numOfDays
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
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ visitorStayId }) => ({ variables: { _id: visitorStayId } }),
  }),
  graphql(formMutation, {
    name: 'updateVisitorStay',
    options: {
      refetchQueries: ['pagedVisitorStays'],
    },
  }),
  WithAllMSDuties(),
  WithAllDutyShifts(),
  WithDistinctStayAllowedBy(),
  WithDistinctTeamNames()
)(EditForm);
