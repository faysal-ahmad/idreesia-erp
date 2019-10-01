import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import {
  TimeField,
  SelectField,
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { WithAllDuties } from '/imports/ui/modules/hr/common/composers';
import { RecordInfo } from '/imports/ui/modules/helpers/controls';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    allDutiesLoading: PropTypes.bool,
    allDuties: PropTypes.array,
    formDataLoading: PropTypes.bool,
    dutyShiftById: PropTypes.object,
    updateDutyShift: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.dutyShiftsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, dutyShiftById, updateDutyShift } = this.props;
    form.validateFields((err, { name, dutyId, startTime, endTime }) => {
      if (err) return;

      updateDutyShift({
        variables: {
          id: dutyShiftById._id,
          name,
          dutyId,
          startTime,
          endTime,
        },
      })
        .then(() => {
          history.push(paths.dutyShiftsPath);
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const {
      formDataLoading,
      allDutiesLoading,
      allDuties,
      dutyShiftById,
    } = this.props;
    const { getFieldDecorator } = this.props.form;
    if (formDataLoading || allDutiesLoading) return null;

    debugger;
    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={dutyShiftById.name}
            required
            requiredMessage="Please input a name for the duty location."
            getFieldDecorator={getFieldDecorator}
          />
          <SelectField
            data={allDuties}
            getDataValue={({ _id }) => _id}
            getDataText={({ name }) => name}
            initialValue={dutyShiftById.dutyId}
            fieldName="dutyId"
            fieldLabel="Duty Name"
            required
            requiredMessage="Please select a duty from the list."
            getFieldDecorator={getFieldDecorator}
          />
          <TimeField
            fieldName="startTime"
            fieldLabel="Start Time"
            initialValue={
              dutyShiftById.startTime ? moment(dutyShiftById.startTime) : null
            }
            getFieldDecorator={getFieldDecorator}
          />

          <TimeField
            fieldName="endTime"
            fieldLabel="End Time"
            initialValue={
              dutyShiftById.endTime ? moment(dutyShiftById.endTime) : null
            }
            getFieldDecorator={getFieldDecorator}
          />
          <FormButtonsSaveCancel handleCancel={this.handleCancel} />
        </Form>
        <RecordInfo record={dutyShiftById} />
      </Fragment>
    );
  }
}

const formQuery = gql`
  query dutyShiftById($id: String!) {
    dutyShiftById(id: $id) {
      _id
      name
      dutyId
      startTime
      endTime
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

const formMutation = gql`
  mutation updateDutyShift(
    $id: String!
    $name: String!
    $dutyId: String!
    $startTime: String
    $endTime: String
  ) {
    updateDutyShift(
      id: $id
      name: $name
      dutyId: $dutyId
      startTime: $startTime
      endTime: $endTime
    ) {
      _id
      name
      dutyId
      startTime
      endTime
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: 'updateDutyShift',
    options: {
      refetchQueries: ['allDutyShifts'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { shiftId } = match.params;
      return { variables: { id: shiftId } };
    },
  }),
  WithAllDuties(),
  WithBreadcrumbs(['HR', 'Setup', 'Duty Shifts', 'Edit'])
)(EditForm);
