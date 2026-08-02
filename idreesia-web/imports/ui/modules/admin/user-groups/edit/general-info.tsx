import React, { useState } from 'react';
import { type History } from 'history';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form, message } from 'antd';

import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import {
  USER_GROUP_GENERAL_INFO_BY_ID,
  UPDATE_USER_GROUP,
  PAGED_USER_GROUPS,
} from '../gql';

interface Props {
  groupId: string;
  history: History;
}

interface FormValues {
  name: string;
  description?: string;
}

const GeneralInfo = ({ groupId, history }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { data, loading } = useQuery(USER_GROUP_GENERAL_INFO_BY_ID, {
    variables: { _id: groupId },
  });
  const [updateUserGroup] = useMutation(UPDATE_USER_GROUP, {
    refetchQueries: [{ query: PAGED_USER_GROUPS }],
  });
  const userGroupById = data?.userGroupById;

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, description }: FormValues) => {
    updateUserGroup({
      variables: {
        _id: userGroupById?._id ?? groupId,
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
    <Form
      layout="horizontal"
      onFinish={handleFinish}
      onFieldsChange={handleFieldsChange}
    >
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

export default GeneralInfo;
