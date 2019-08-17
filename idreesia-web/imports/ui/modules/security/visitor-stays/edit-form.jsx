import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { flowRight } from "lodash";

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

class EditForm extends Component {
  static propTypes = {
    form: PropTypes.object,
    visitorStayId: PropTypes.string,
    handleSaveItem: PropTypes.func,
    updateVisitorStay: PropTypes.func,

    formDataLoading: PropTypes.bool,
    visitorStayById: PropTypes.object,
    allDuties: PropTypes.array,
    allDutiesLoading: PropTypes.bool,
    allDutyShifts: PropTypes.array,
    allDutyShiftsLoading: PropTypes.bool,
    distinctStayAllowedBy: PropTypes.array,
    distinctStayAllowedByLoading: PropTypes.bool,
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
      (err, { numOfDays, stayReason, stayAllowedBy, dutyIdShiftId, notes }) => {
        if (err) return;

        updateVisitorStay({
          variables: {
            _id: visitorStayById._id,
            numOfDays,
            stayReason,
            stayAllowedBy,
            dutyId: dutyIdShiftId ? dutyIdShiftId[0] : null,
            shiftId: dutyIdShiftId ? dutyIdShiftId[1] : null,
            notes,
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
      allDutiesLoading,
      allDutyShiftsLoading,
      distinctStayAllowedByLoading,
      allDuties,
      allDutyShifts,
      distinctStayAllowedBy,
      form: { getFieldDecorator },
    } = this.props;
    if (
      formDataLoading ||
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
          minValue={1}
          initialValue={visitorStayById.numOfDays}
          getFieldDecorator={getFieldDecorator}
        />
        <SelectField
          data={StayReasons}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="stayReason"
          fieldLabel="Stay Reason"
          initialValue={visitorStayById.stayReason}
          getFieldDecorator={getFieldDecorator}
        />
        <AutoCompleteField
          fieldName="stayAllowedBy"
          fieldLabel="Stay Allowed By"
          dataSource={distinctStayAllowedBy}
          initialValue={visitorStayById.stayAllowedBy}
          getFieldDecorator={getFieldDecorator}
        />
        <CascaderField
          data={dutyShiftCascaderData}
          changeOnSelect={false}
          fieldName="dutyIdShiftId"
          fieldLabel="Duty Participation"
          initialValue={[visitorStayById.dutyId, visitorStayById.shiftId]}
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextAreaField
          fieldName="notes"
          fieldLabel="Notes"
          initialValue={visitorStayById.notes}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSubmit text="Update Stay" />
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
      notes
    }
  }
`;

const formMutation = gql`
  mutation updateVisitorStay(
    $_id: String!
    $numOfDays: Float!
    $stayReason: String
    $stayAllowedBy: String
    $dutyId: String
    $shiftId: String
    $notes: String
  ) {
    updateVisitorStay(
      _id: $_id
      numOfDays: $numOfDays
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
      numOfDays
      stayReason
      stayAllowedBy
      dutyId
      shiftId
      notes
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
    name: "updateVisitorStay",
    options: {
      refetchQueries: ["pagedVisitorStays"],
    },
  }),
  WithAllDuties(),
  WithAllDutyShifts(),
  WithDistinctStayAllowedBy()
)(EditForm);
