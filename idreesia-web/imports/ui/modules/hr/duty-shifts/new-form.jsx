import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

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

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    allDuties: PropTypes.array,
    createDutyShift: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.dutyShiftsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createDutyShift, history } = this.props;
    form.validateFields((err, { name, dutyId, startTime, endTime }) => {
      if (err) return;

      createDutyShift({
        variables: {
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
    const { getFieldDecorator } = this.props.form;
    const { allDuties } = this.props;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required
          requiredMessage="Please input a name for the duty shift."
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
        <TimeField
          fieldName="startTime"
          fieldLabel="Start Time"
          getFieldDecorator={getFieldDecorator}
        />

        <TimeField
          fieldName="endTime"
          fieldLabel="End Time"
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createDutyShift(
    $name: String!
    $dutyId: String!
    $startTime: String
    $endTime: String
  ) {
    createDutyShift(
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
    }
  }
`;

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: 'createDutyShift',
    options: {
      refetchQueries: ['allDutyShifts'],
    },
  }),
  WithAllDuties(),
  WithBreadcrumbs(['HR', 'Setup', 'Duty Shifts', 'New'])
)(NewForm);
