import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Form, message } from '/imports/ui/controls';
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
    form.validateFields((err, { name, cnicNumber, currentAddress }) => {
      if (err) return;

      updateKarkun({
        variables: {
          _id: karkunById._id,
          name,
          cnicNumber,
          currentAddress,
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
          fieldName="name"
          fieldLabel="Name"
          initialValue={karkunById.name}
          required
          requiredMessage="Please input the name for the karkun."
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
          fieldName="currentAddress"
          fieldLabel="Current Address"
          initialValue={karkunById.currentAddress}
          required={false}
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
      name
      cnicNumber
      currentAddress
    }
  }
`;

const formMutation = gql`
  mutation updateKarkun(
    $_id: String!
    $name: String!
    $cnicNumber: String!
    $currentAddress: String
  ) {
    updateKarkun(
      _id: $_id
      name: $name
      cnicNumber: $cnicNumber
      currentAddress: $currentAddress
    ) {
      _id
      name
      cnicNumber
      currentAddress
    }
  }
`;

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: 'updateKarkun',
    options: {
      refetchQueries: ['pagedKarkuns'],
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
