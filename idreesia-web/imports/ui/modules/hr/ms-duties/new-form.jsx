import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    createDuty: PropTypes.func,
  };
  
  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ name, description, attendanceSheet }) => {
    const { createDuty, history } = this.props;
    createDuty({
      variables: {
        name,
        isMehfilDuty: false,
        description,
        attendanceSheet,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const isFieldsTouched = this.state.isFieldsTouched;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Duty Name"
          required
          requiredMessage="Please input a name for the duty."
        />
        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
        />
        <InputTextField
          fieldName="attendanceSheet"
          fieldLabel="Attendance Sheet"
        />
        <FormButtonsSaveCancel
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createDuty(
    $name: String!
    $isMehfilDuty: Boolean!
    $description: String
    $attendanceSheet: String
  ) {
    createDuty(
      name: $name
      isMehfilDuty: $isMehfilDuty
      description: $description
      attendanceSheet: $attendanceSheet
    ) {
      _id
      name
      isMehfilDuty
      description
      attendanceSheet
    }
  }
`;

export default flowRight(
  graphql(formMutation, {
    name: 'createDuty',
    options: {
      refetchQueries: ['allMSDuties'],
    },
  }),
  WithBreadcrumbs(['HR', 'Duties & Shifts', 'New'])
)(NewForm);
