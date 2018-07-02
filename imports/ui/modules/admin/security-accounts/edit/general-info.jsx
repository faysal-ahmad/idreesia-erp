import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Form, message } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    karkunId: PropTypes.string,
    karkunById: PropTypes.object,
    updateKarkun: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.accountsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, karkunById, updateKarkun } = this.props;
    form.validateFields((err, { firstName, lastName, cnicNumber, address }) => {
      if (err) return;

      updateKarkun({
        variables: {
          _id: karkunById._id,
          firstName,
          lastName,
          cnicNumber,
          address,
        },
      })
        .then(() => {
          history.push(paths.accountsPath);
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const { loading, karkunById } = this.props;
    const { getFieldDecorator } = this.props.form;
    if (loading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="firstName"
          fieldLabel="First Name"
          initialValue={karkunById.firstName}
          required
          requiredMessage="Please input the first name for the karkun."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="lastName"
          fieldLabel="Last Name"
          initialValue={karkunById.lastName}
          required
          requiredMessage="Please input the last name for the karkun."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="cnicNumber"
          fieldLabel="CNIC Number"
          initialValue={karkunById.cnicNumber}
          required
          requiredMessage="Please input the CNIC for the karkun."
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="primaryContactNumber"
          fieldLabel="Contact No. 1"
          initialValue={karkunById.primaryContactNumber}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="secondaryContactNumber"
          fieldLabel="Contact No. 2"
          initialValue={karkunById.secondaryContactNumber}
          required={false}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
          initialValue={karkunById.address}
          required={false}
          requiredMessage="Please input the address for the karkun."
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formQuery = gql`
  query karkunById($_id: String!) {
    karkunById(_id: $_id) {
      _id
      firstName
      lastName
      cnicNumber
      address
    }
  }
`;

const formMutation = gql`
  mutation updateKarkun(
    $_id: String!
    $firstName: String!
    $lastName: String!
    $cnicNumber: String!
    $address: String
  ) {
    updateKarkun(
      _id: $_id
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
    name: 'updateKarkun',
    options: {
      refetchQueries: ['allKarkuns'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    },
  })
)(GeneralInfo);
