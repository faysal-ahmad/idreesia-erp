import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import { WithBreadcrumbs } from "/imports/ui/composers";
import { AdminSubModulePaths as paths } from "/imports/ui/modules/admin";
import {
  InputTextField,
  SwitchField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    companyById: PropTypes.object,
    updateCompany: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.companiesPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, companyById, updateCompany } = this.props;
    form.validateFields((err, { name, importData, connectivitySettings }) => {
      if (err) return;

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
    });
  };

  render() {
    const { loading, companyById } = this.props;
    if (loading) return null;
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={companyById.name}
          required
          requiredMessage="Please input a name for the company."
          getFieldDecorator={getFieldDecorator}
        />
        <SwitchField
          fieldName="importData"
          fieldLabel="Import Data"
          initialValue={companyById.importData}
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextAreaField
          fieldName="connectivitySettings"
          fieldLabel="Connectivity Settings"
          initialValue={companyById.connectivitySettings}
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
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

export default compose(
  Form.create(),
  graphql(formMutation, {
    name: "updateCompany",
    options: {
      refetchQueries: ["allCompanies"],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { companyId } = match.params;
      return { variables: { id: companyId } };
    },
  }),
  WithBreadcrumbs(["Admin", "Setup", "Companies", "Edit"])
)(EditForm);
