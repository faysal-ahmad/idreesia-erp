import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { flowRight } from 'lodash';
import { graphql } from 'react-apollo';
import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import {
  WithAllDuties,
  WithAllDutyShifts,
} from '/imports/ui/modules/hr/common/composers';
import {
  InputNumberField,
  CascaderField,
  MonthField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';
import { getDutyShiftCascaderData } from '/imports/ui/modules/hr/common/utilities';

class EditForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    attendanceById: PropTypes.object,
    formDataLoading: PropTypes.bool,
    allDuties: PropTypes.array,
    allDutiesLoading: PropTypes.bool,
    allDutyShifts: PropTypes.array,
    allDutyShiftsLoading: PropTypes.bool,
    updateAttendance: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.attendanceSheetsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { attendanceById, form, updateAttendance, history } = this.props;
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

        updateAttendance({
          variables: {
            _id: attendanceById._id,
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
    const {
      formDataLoading,
      allDutiesLoading,
      allDutyShiftsLoading,
    } = this.props;
    if (formDataLoading || allDutiesLoading || allDutyShiftsLoading)
      return null;

    const { getFieldDecorator } = this.props.form;
    const { allDuties, allDutyShifts, attendanceById } = this.props;
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
          initialValue={attendanceById.karkun}
          getFieldDecorator={getFieldDecorator}
        />
        <CascaderField
          data={dutyShiftCascaderData}
          changeOnSelect={false}
          fieldName="dutyIdShiftId"
          fieldLabel="Duty/Shift"
          initialValue={[attendanceById.dutyId, attendanceById.shiftId]}
          required
          requiredMessage="Please select a duty and shift from the list."
          getFieldDecorator={getFieldDecorator}
        />
        <MonthField
          allowClear={false}
          fieldName="month"
          fieldLabel="Month"
          initialValue={moment(`01-${attendanceById.month}`, 'DD-MM-YYYY')}
          required
          requiredMessage="Select a month for the attendances."
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          fieldName="totalCount"
          fieldLabel="Total Days"
          initialValue={attendanceById.totalCount}
          minValue={0}
          maxValue={31}
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          fieldName="presentCount"
          fieldLabel="Present Days"
          initialValue={attendanceById.presentCount}
          minValue={0}
          maxValue={31}
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          fieldName="absentCount"
          fieldLabel="Absent Days"
          initialValue={attendanceById.absentCount}
          minValue={0}
          maxValue={31}
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formQuery = gql`
  query attendanceById($_id: String!) {
    attendanceById(_id: $_id) {
      _id
      karkunId
      dutyId
      shiftId
      month
      totalCount
      presentCount
      absentCount
      karkun {
        _id
        name
      }
    }
  }
`;

const formMutation = gql`
  mutation updateAttendance(
    $_id: String!
    $karkunId: String!
    $dutyId: String!
    $shiftId: String!
    $month: String!
    $totalCount: Int
    $presentCount: Int
    $absentCount: Int
  ) {
    updateAttendance(
      _id: $_id
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
    name: 'updateAttendance',
    options: {
      refetchQueries: ['attendanceByMonth'],
    },
  }),
  WithAllDuties(),
  WithAllDutyShifts(),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { attendanceId } = match.params;
      return { variables: { _id: attendanceId } };
    },
  }),
  WithBreadcrumbs(['HR', 'Attendance Sheets', 'Edit Attendance'])
)(EditForm);
