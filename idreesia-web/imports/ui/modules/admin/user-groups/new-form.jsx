import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { ModuleNames } from 'meteor/idreesia-common/constants';
import { flowRight, values } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  InputTextField,
  InputTextAreaField,
  SelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { CREATE_USER_GROUP } from './gql';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    createUserGroup: PropTypes.func,
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

  handleFinish = ({ name, moduleName, description }) => {
    const { createUserGroup, history } = this.props;
    createUserGroup({
      variables: {
        name,
        moduleName,
        description,
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
    const moduleNames = values(ModuleNames);
    const moduleNamesData = moduleNames.map(name => ({
      value: name,
      text: name,
    }));
  
    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Group name"
          required
          requiredMessage="Please input a name for the group."
        />

        <SelectField
          data={moduleNamesData}
          getDataValue={({ value }) => value}
          getDataText={({ text }) => text}
          fieldName="moduleName"
          fieldLabel="Module Name"
          required
          requiredMessage="Please select a module for the group."
        />

        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
        />

        <FormButtonsSaveCancel
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

export default flowRight(
  graphql(CREATE_USER_GROUP, {
    name: 'createUserGroup',
    options: {
      refetchQueries: ['pagedUserGroups'],
    },
  }),
  WithBreadcrumbs(['Admin', 'User Groups', 'New'])
)(NewForm);
