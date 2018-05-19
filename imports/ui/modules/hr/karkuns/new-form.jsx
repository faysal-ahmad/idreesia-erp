import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Form, message } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel
} from '/imports/ui/modules/helpers/fields';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    createKarkun: PropTypes.func
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.karkunsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createKarkun, history } = this.props;
    form.validateFields((err, { firstName, lastName, cnicNumber, address }) => {
      if (err) return;

      createKarkun({
        variables: {
          firstName,
          lastName,
          cnicNumber,
          address
        }
      })
        .then(() => {
          history.push(paths.karkunsPath);
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="firstName"
          fieldLabel="First Name"
          required={true}
          requiredMessage="Please input the first name for the karkun."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="lastName"
          fieldLabel="Last Name"
          required={true}
          requiredMessage="Please input the last name for the karkun."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="cnicNumber"
          fieldLabel="CNIC Number"
          required={true}
          requiredMessage="Please input the CNIC for the karkun."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
          required={false}
          requiredMessage="Please input the address for the karkun."
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createKarkun(
    $firstName: String!
    $lastName: String!
    $cnicNumber: String!
    $address: String
  ) {
    createKarkun(
      firstName: $firstName
      lastName: $lastName
      cnicNumber: $cnicNumber
      address: $address
    ) {
      _id
      firstName
      lastName
      cnicNumber
      address
    }
  }
`;

export default merge(
  Form.create(),
  graphql(formMutation, {
    name: 'createKarkun',
    options: {
      refetchQueries: ['allKarkuns']
    }
  }),
  WithBreadcrumbs(['HR', 'Karkuns', 'New'])
)(NewForm);
