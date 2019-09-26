import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { flowRight } from "lodash";

import { Formats } from "meteor/idreesia-common/constants";
import { Form, message } from "/imports/ui/controls";
import { WithBreadcrumbs } from "/imports/ui/composers";
import { HRSubModulePaths as paths } from "/imports/ui/modules/hr";
import {
  WithAllDuties,
  WithAllDutyShifts,
} from "/imports/ui/modules/hr/common/composers";
import {
  InputNumberField,
  CascaderField,
  MonthField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";

import { KarkunField } from "/imports/ui/modules/hr/karkuns/field";
import { getDutyShiftCascaderData } from "/imports/ui/modules/hr/common/utilities";

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    allDuties: PropTypes.array,
    allDutiesLoading: PropTypes.bool,
    allDutyShifts: PropTypes.array,
    allDutyShiftsLoading: PropTypes.bool,
    createAttendance: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.attendanceSheetsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createAttendance, history } = this.props;
    form.validateFields(
      (
        err,
        {
          karkunId,
          dutyIdShiftId,
          month,
          totalCount,
          presentCount,
          absentCount,
        }
      ) => {
        if (err) return;

        createAttendance({
          variables: {
            karkunId,
            dutyId: dutyIdShiftId[0],
            shiftId: dutyIdShiftId[1],
            month: month.format(Formats.DATE_FORMAT),
            totalCount,
            presentCount,
            absentCount,
          },
        })
          .then(() => {
            history.push(paths.attendanceSheetsPath);
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const { allDutiesLoading, allDutyShiftsLoading } = this.props;
    if (allDutiesLoading || allDutyShiftsLoading) return null;

    const { getFieldDecorator } = this.props.form;
    const { allDuties, allDutyShifts } = this.props;
    const dutyShiftCascaderData = getDutyShiftCascaderData(
      allDuties,
      allDutyShifts
    );

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <KarkunField
          required
          requiredMessage="Please select a name for Karkun."
          fieldName="karkunId"
          fieldLabel="Karkun"
          getFieldDecorator={getFieldDecorator}
        />
        <CascaderField
          data={dutyShiftCascaderData}
          changeOnSelect={false}
          fieldName="dutyIdShiftId"
          fieldLabel="Duty/Shift"
          required
          requiredMessage="Please select a duty and shift from the list."
          getFieldDecorator={getFieldDecorator}
        />
        <MonthField
          allowClear={false}
          fieldName="month"
          fieldLabel="Month"
          required
          requiredMessage="Select a month for the attendances."
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          fieldName="totalCount"
          fieldLabel="Total Days"
          initialValue={0}
          minValue={0}
          maxValue={31}
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          fieldName="presentCount"
          fieldLabel="Present Days"
          initialValue={0}
          minValue={0}
          maxValue={31}
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          fieldName="absentCount"
          fieldLabel="Absent Days"
          initialValue={0}
          minValue={0}
          maxValue={31}
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createAttendance(
    $karkunId: String!
    $dutyId: String!
    $shiftId: String!
    $month: String!
    $totalCount: Int
    $presentCount: Int
    $absentCount: Int
  ) {
    createAttendance(
      karkunId: $karkunId
      dutyId: $dutyId
      shiftId: $shiftId
      month: $month
      totalCount: $totalCount
      presentCount: $presentCount
      absentCount: $absentCount
    ) {
      _id
      karkunId
      dutyId
      shiftId
      month
      totalCount
      presentCount
      absentCount
    }
  }
`;

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: "createAttendance",
    options: {
      refetchQueries: ["attendanceByMonth"],
    },
  }),
  WithAllDuties(),
  WithAllDutyShifts(),
  WithBreadcrumbs(["HR", "Attendance Sheets", "New Attendance"])
)(NewForm);
