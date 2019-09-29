import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

import { Formats } from 'meteor/idreesia-common/constants';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import {
  WithAllDuties,
  WithAllDutyShifts,
} from '/imports/ui/modules/hr/common/composers';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import {
  CascaderField,
  InputFileField,
  MonthField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { getDutyShiftCascaderData } from '/imports/ui/modules/hr/common/utilities';

class UploadForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    allDuties: PropTypes.array,
    allDutiesLoading: PropTypes.bool,
    allDutyShifts: PropTypes.array,
    allDutyShiftsLoading: PropTypes.bool,
    uploadAttendances: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.attendanceSheetsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, uploadAttendances, history } = this.props;
    form.validateFields((err, { csv, month, dutyIdShiftId }) => {
      if (err) return;

      uploadAttendances({
        variables: {
          csv,
          month: month.format(Formats.DATE_FORMAT),
          dutyId: dutyIdShiftId[0],
          shiftId: dutyIdShiftId[1],
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
    const { allDutiesLoading, allDutyShiftsLoading } = this.props;
    if (allDutiesLoading || allDutyShiftsLoading) return null;

    const { allDuties, allDutyShifts } = this.props;
    const dutyShiftCascaderData = getDutyShiftCascaderData(
      allDuties,
      allDutyShifts
    );

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
        <CascaderField
          data={dutyShiftCascaderData}
          changeOnSelect={false}
          fieldName="dutyIdShiftId"
          fieldLabel="Duty/Shift"
          required
          requiredMessage="Please select a duty and shift from the list."
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

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: 'uploadAttendances',
  }),
  WithAllDuties(),
  WithAllDutyShifts(),
  WithBreadcrumbs(['HR', 'Attendance Sheets', 'Upload'])
)(UploadForm);
