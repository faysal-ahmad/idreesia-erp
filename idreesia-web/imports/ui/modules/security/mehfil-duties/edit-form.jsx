import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    loading: PropTypes.bool,
    securityMehfilDutyById: PropTypes.object,
    updateSecurityMehfilDuty: PropTypes.func,
  };

  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.mehfilDutiesPath);
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ name, urduName }) => {
    const { history, securityMehfilDutyById, updateSecurityMehfilDuty } = this.props;
    updateSecurityMehfilDuty({
      variables: {
        id: securityMehfilDutyById._id,
        name,
        urduName,
      },
    })
      .then(() => {
        history.push(paths.mehfilDutiesPath);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { loading, securityMehfilDutyById } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (loading) return null;

    return (
      <Fragment>
        <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={securityMehfilDutyById.name}
            required
            requiredMessage="Please input a name for the mehfil duty."
          />
          <InputTextField
            fieldName="urduName"
            fieldLabel="Urdu Name"
            initialValue={securityMehfilDutyById.urduName}
            required
            requiredMessage="Please input an urdu name for the mehfil duty."
          />
          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <AuditInfo record={securityMehfilDutyById} />
      </Fragment>
    );
  }
}

const formQuery = gql`
  query securityMehfilDutyById($id: String!) {
    securityMehfilDutyById(id: $id) {
      _id
      name
      urduName
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

const formMutation = gql`
  mutation updateSecurityMehfilDuty($id: String!, $name: String!, $urduName: String!) {
    updateSecurityMehfilDuty(id: $id, name: $name, urduName: $urduName) {
      _id
      name
      urduName
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default flowRight(
  graphql(formMutation, {
    name: 'updateSecurityMehfilDuty',
    options: {
      refetchQueries: ['allSecurityMehfilDuties'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { mehfilDutyId } = match.params;
      return { variables: { id: mehfilDutyId } };
    },
  }),
  WithBreadcrumbs(['Security', 'Mehfil Duties', 'Edit'])
)(EditForm);
