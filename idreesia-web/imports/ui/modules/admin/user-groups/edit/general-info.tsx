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

const AntForm = Form as any;
const TextField = InputTextField as any;
const TextAreaField = InputTextAreaField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
interface HistoryLike { goBack(): void; }
interface UserGroup { _id: string; name?: string; description?: string; }
interface QueryData { userGroupById?: UserGroup | null; }
interface Props { groupId?: string | null; history: HistoryLike; }
interface FormValues { name: string; description?: string; }

const GeneralInfo = ({ groupId, history }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { data, loading } = useQuery(formQuery as any, {
    variables: { _id: groupId },
  });
  const [updateUserGroup] = useMutation(formMutation as any, {
    refetchQueries: ['pagedUserGroups'],
  });
  const { userGroupById } = (data ?? {}) as QueryData;

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, description }: FormValues) => {
    updateUserGroup({
      variables: {
        _id: userGroupById?._id,
        name,
        description,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (loading || !userGroupById) return null;

  return (
    <AntForm layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <TextField
        fieldName="name"
        fieldLabel="Name"
        initialValue={userGroupById.name}
      />

      <TextAreaField
        fieldName="description"
        fieldLabel="Description"
        initialValue={userGroupById.description}
      />

      <SaveCancelButtons
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </AntForm>
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
