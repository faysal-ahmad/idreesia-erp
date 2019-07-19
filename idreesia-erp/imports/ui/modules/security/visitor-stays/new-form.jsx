import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import moment from "moment";

import { Formats } from "meteor/idreesia-common/constants";
import {
  AutoCompleteField,
  CascaderField,
  InputNumberField,
  InputTextAreaField,
  SelectField,
  FormButtonsSubmit,
} from "/imports/ui/modules/helpers/fields";

import {
  WithAllDuties,
  WithAllDutyShifts,
} from "/imports/ui/modules/hr/common/composers";
import { WithDistinctStayAllowedBy } from "/imports/ui/modules/security/common/composers";
import { getDutyShiftCascaderData } from "/imports/ui/modules/hr/common/utilities";

import StayReasons from "../common/constants/stay-reasons";

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
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, visitorId, handleAddItem, createVisitorStay } = this.props;
    form.validateFields(
      (err, { numOfDays, stayReason, stayAllowedBy, dutyIdShiftId, notes }) => {
        if (err) return;

        const fromDate = moment();
        const toDate = moment();
        if (numOfDays > 1) {
          toDate.add(numOfDays - 1, "days");
        }

        createVisitorStay({
          variables: {
            visitorId,
            fromDate: fromDate.format(Formats.DATE_FORMAT),
            toDate: toDate.format(Formats.DATE_FORMAT),
            stayReason,
            stayAllowedBy,
            dutyId: dutyIdShiftId ? dutyIdShiftId[0] : null,
            shiftId: dutyIdShiftId ? dutyIdShiftId[1] : null,
            notes,
          },
        })
          .then(() => {
            if (handleAddItem) handleAddItem();
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
      allDuties,
      allDutyShifts,
      distinctStayAllowedBy,
      form: { getFieldDecorator },
    } = this.props;
    if (
      allDutiesLoading ||
      allDutyShiftsLoading ||
      distinctStayAllowedByLoading
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
        <SelectField
          data={StayReasons}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="stayReason"
          fieldLabel="Stay Reason"
          getFieldDecorator={getFieldDecorator}
        />
        <AutoCompleteField
          fieldName="stayAllowedBy"
          fieldLabel="Stay Allowed By"
          dataSource={distinctStayAllowedBy}
          getFieldDecorator={getFieldDecorator}
        />
        <CascaderField
          data={dutyShiftCascaderData}
          changeOnSelect={false}
          fieldName="dutyIdShiftId"
          fieldLabel="Duty Participation"
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextAreaField
          fieldName="notes"
          fieldLabel="Notes"
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
    $fromDate: String!
    $toDate: String!
    $stayReason: String
    $stayAllowedBy: String
    $dutyId: String
    $shiftId: String
    $notes: String
  ) {
    createVisitorStay(
      visitorId: $visitorId
      fromDate: $fromDate
      toDate: $toDate
      stayReason: $stayReason
      stayAllowedBy: $stayAllowedBy
      dutyId: $dutyId
      shiftId: $shiftId
      notes: $notes
    ) {
      _id
      visitorId
      fromDate
      toDate
      stayReason
      stayAllowedBy
      dutyId
      shiftId
      notes
    }
  }
`;

export default compose(
  Form.create(),
  graphql(formMutation, {
    name: "createVisitorStay",
    options: {
      refetchQueries: ["pagedVisitorStays"],
    },
  }),
  WithAllDuties(),
  WithAllDutyShifts(),
  WithDistinctStayAllowedBy()
)(NewForm);
