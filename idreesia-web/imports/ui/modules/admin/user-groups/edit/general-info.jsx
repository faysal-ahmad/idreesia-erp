import React, { Component } from 'react';
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

class GeneralInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    loading: PropTypes.bool,
    groupId: PropTypes.string,
    userGroupById: PropTypes.object,
    updateUserGroup: PropTypes.func,
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

  handleFinish = ({ name, description }) => {
    const { history, userGroupById, updateUserGroup } = this.props;
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
  };

  render() {
    const { loading, userGroupById } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (loading) return null;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={userGroupById.name}
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
