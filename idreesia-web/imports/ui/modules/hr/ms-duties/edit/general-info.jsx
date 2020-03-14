import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Form, message } from '/imports/ui/controls';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    dutyById: PropTypes.object,
    updateDuty: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, dutyById, updateDuty } = this.props;
    form.validateFields((err, { name, description, attendanceSheet }) => {
      if (err) return;

      updateDuty({
        variables: {
          id: dutyById._id,
          name,
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
    });
  };

  render() {
    const { loading, dutyById } = this.props;
    const { getFieldDecorator, isFieldsTouched } = this.props.form;
    if (loading) return null;

    return (
      <Fragment>
        <Form layout="horizontal" onSubmit={this.handleSubmit}>
          <InputTextField
            fieldName="name"
            fieldLabel="Duty Name"
            initialValue={dutyById.name}
            required
            requiredMessage="Please input a name for the duty."
            getFieldDecorator={getFieldDecorator}
          />
          <InputTextAreaField
            fieldName="description"
            fieldLabel="Description"
            initialValue={dutyById.description}
            getFieldDecorator={getFieldDecorator}
          />
          <InputTextField
            fieldName="attendanceSheet"
            fieldLabel="Attendance Sheet"
            initialValue={dutyById.attendanceSheet}
            getFieldDecorator={getFieldDecorator}
          />
          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <AuditInfo record={dutyById} />
      </Fragment>
    );
  }
}

const formQuery = gql`
  query dutyById($id: String!) {
    dutyById(id: $id) {
      _id
      name
      description
      attendanceSheet
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

const formMutation = gql`
  mutation updateDuty(
    $id: String!
    $name: String!
    $description: String
    $attendanceSheet: String
  ) {
    updateDuty(
      id: $id
      name: $name
      description: $description
      attendanceSheet: $attendanceSheet
    ) {
      _id
      name
      description
      attendanceSheet
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
    name: 'updateDuty',
    options: {
      refetchQueries: ['allMSDuties'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ dutyId }) => ({ variables: { id: dutyId } }),
  })
)(EditForm);
