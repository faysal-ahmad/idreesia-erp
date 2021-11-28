import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
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

    loading: PropTypes.bool,
    dutyById: PropTypes.object,
    updateDuty: PropTypes.func,
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
    const { history, dutyById, updateDuty } = this.props;
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
  };

  render() {
    const { loading, dutyById } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (loading) return null;

    return (
      <Fragment>
        <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
          <InputTextField
            fieldName="name"
            fieldLabel="Duty Name"
            initialValue={dutyById.name}
            required
            requiredMessage="Please input a name for the duty."
          />
          <InputTextAreaField
            fieldName="description"
            fieldLabel="Description"
            initialValue={dutyById.description}
          />
          <InputTextField
            fieldName="attendanceSheet"
            fieldLabel="Attendance Sheet"
            initialValue={dutyById.attendanceSheet}
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
