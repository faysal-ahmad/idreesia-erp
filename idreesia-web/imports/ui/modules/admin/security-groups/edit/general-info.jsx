import React, { Component } from 'react';
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

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    groupId: PropTypes.string,
    securityGroupById: PropTypes.object,
    updateSecurityGroup: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      history,
      securityGroupById,
      updateSecurityGroup,
    } = this.props;
    form.validateFields((err, { name, description }) => {
      if (err) return;

      updateSecurityGroup({
        variables: {
          _id: securityGroupById.user._id,
          name,
          description,
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
    const { loading, securityGroupById } = this.props;
    const { getFieldDecorator } = this.props.form;
    if (loading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          getFieldDecorator={getFieldDecorator}
          initialValue={securityGroupById.name}
        />

        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
          getFieldDecorator={getFieldDecorator}
          initialValue={securityGroupById.description}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formQuery = gql`
  query securityGroupById($_id: String!) {
    securityGroupById(_id: $_id) {
      _id
      name
      description
    }
  }
`;

const formMutation = gql`
  mutation updateSecurityGroup(
    $_id: String!
    $name: String!
    $description: String
  ) {
    updateSecurityGroup(_id: $_id, name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: 'updateSecurityGroup',
    options: {
      refetchQueries: ['pagedSecurityGroups'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ groupId }) => ({ variables: { _id: groupId } }),
  })
)(GeneralInfo);
