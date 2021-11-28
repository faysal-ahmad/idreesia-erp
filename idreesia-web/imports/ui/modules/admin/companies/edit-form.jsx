import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import {
  InputTextField,
  SwitchField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    loading: PropTypes.bool,
    companyById: PropTypes.object,
    updateCompany: PropTypes.func,
  };

  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.companiesPath);
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ name, importData, connectivitySettings }) => {
    const { history, companyById, updateCompany } = this.props;
    updateCompany({
      variables: {
        _id: companyById._id,
        name,
        importData,
        connectivitySettings,
      },
    })
      .then(() => {
        history.push(paths.companiesPath);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { loading, companyById } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (loading) return null;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={companyById.name}
          required
          requiredMessage="Please input a name for the company."
        />
        <SwitchField
          fieldName="importData"
          fieldLabel="Import Data"
          initialValue={companyById.importData}
        />
        <InputTextAreaField
          fieldName="connectivitySettings"
          fieldLabel="Connectivity Settings"
          initialValue={companyById.connectivitySettings}
        />
        <FormButtonsSaveCancel
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

const formQuery = gql`
  query companyById($id: String!) {
    companyById(id: $id) {
      _id
      name
      importData
      connectivitySettings
    }
  }
`;

const formMutation = gql`
  mutation updateCompany(
    $_id: String!
    $name: String!
    $importData: String!
    $connectivitySettings: String
  ) {
    updateCompany(
      _id: $_id
      name: $name
      importData: $importData
      connectivitySettings: $connectivitySettings
    ) {
      _id
      name
      importData
      connectivitySettings
    }
  }
`;

export default flowRight(
  graphql(formMutation, {
    name: 'updateCompany',
    options: {
      refetchQueries: ['allCompanies'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { companyId } = match.params;
      return { variables: { id: companyId } };
    },
  }),
  WithBreadcrumbs(['Admin', 'Setup', 'Companies', 'Edit'])
)(EditForm);
