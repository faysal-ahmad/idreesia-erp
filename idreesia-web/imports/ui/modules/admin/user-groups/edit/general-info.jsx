import React, { useState } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form, message } from 'antd';

import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

const GeneralInfo = ({ groupId, history }) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { data, loading } = useQuery(formQuery, {
    variables: { _id: groupId },
  });
  const [updateUserGroup] = useMutation(formMutation, {
    refetchQueries: ['pagedUserGroups'],
  });
  const { userGroupById } = data || {};

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, description }) => {
    updateUserGroup({
      variables: {
        _id: userGroupById._id,
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

  if (loading || !userGroupById) return null;

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="name"
        fieldLabel="Name"
        initialValue={userGroupById.name}
      />

      <InputTextAreaField
        fieldName="description"
        fieldLabel="Description"
        initialValue={userGroupById.description}
      />

      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

GeneralInfo.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,

  groupId: PropTypes.string,
};

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

export default GeneralInfo;
