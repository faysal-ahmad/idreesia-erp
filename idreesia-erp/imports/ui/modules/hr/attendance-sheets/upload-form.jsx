import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { Formats } from "meteor/idreesia-common/constants";
import { WithBreadcrumbs } from "/imports/ui/composers";
import {
  WithAllDuties,
  WithAllDutyShifts,
} from "/imports/ui/modules/hr/common/composers";
import { HRSubModulePaths as paths } from "/imports/ui/modules/hr";
import {
  InputFileField,
  SelectField,
  MonthField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";

class UploadForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    allDuties: PropTypes.array,
    allDutyShifts: PropTypes.array,
    uploadAttendances: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.attendanceSheetsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, uploadAttendances, history } = this.props;
    form.validateFields((err, { csv, month, dutyId, shiftId }) => {
      if (err) return;

      uploadAttendances({
        variables: {
          csv,
          month: month.format(Formats.DATE_FORMAT),
          dutyId,
          shiftId,
        },
      })
        .then(() => {
          history.push(paths.attendanceSheetsPath);
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { allDuties, allDutyShifts } = this.props;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputFileField
          accept=".csv"
          fieldName="csv"
          fieldLabel="Attendance Sheet"
          required
          requiredMessage="Select an attendance sheet to upload."
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
        <SelectField
          data={allDuties}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="dutyId"
          fieldLabel="Duty Name"
          required
          requiredMessage="Please select a duty from the list."
          getFieldDecorator={getFieldDecorator}
        />

        <SelectField
          data={allDutyShifts}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="shiftId"
          fieldLabel="Shift Name"
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation uploadAttendances(
    $csv: String!
    $dutyId: String!
    $month: String!
    $shiftId: String
  ) {
    uploadAttendances(
      csv: $csv
      dutyId: $dutyId
      month: $month
      shiftId: $shiftId
    )
  }
`;

export default compose(
  Form.create(),
  graphql(formMutation, {
    name: "uploadAttendances",
  }),
  WithAllDuties(),
  WithAllDutyShifts(),
  WithBreadcrumbs(["HR", "Attendance Sheets", "Upload"])
)(UploadForm);
