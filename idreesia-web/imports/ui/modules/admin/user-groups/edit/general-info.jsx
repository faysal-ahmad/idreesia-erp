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
    userGroupById: PropTypes.object,
    updateUserGroup: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, userGroupById, updateUserGroup } = this.props;
    form.validateFields((err, { name, description }) => {
      if (err) return;

      updateUserGroup({
        variables: {
          _id: userGroupById.user._id,
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
    const { loading, userGroupById } = this.props;
    const { getFieldDecorator, isFieldsTouched } = this.props.form;
    if (loading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          getFieldDecorator={getFieldDecorator}
          initialValue={userGroupById.name}
        />

        <InputTextAreaField
          fieldName="description"
          fieldLabel="Description"
          getFieldDecorator={getFieldDecorator}
          initialValue={userGroupById.description}
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
  query userGroupById($_id: String!) {
    userGroupById(_id: $_id) {
      _id
      name
      description
    }
  }
`;

const formMutation = gql`
  mutation updateUserGroup(
    $_id: String!
    $name: String!
    $description: String
  ) {
    updateUserGroup(_id: $_id, name: $name, description: $description) {
      _id
      name
      description
    }
  }
`;

export default flowRight(
  Form.create(),
  graphql(formMutation, {
    name: 'updateUserGroup',
    options: {
      refetchQueries: ['pagedUserGroups'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ groupId }) => ({ variables: { _id: groupId } }),
  })
)(GeneralInfo);
