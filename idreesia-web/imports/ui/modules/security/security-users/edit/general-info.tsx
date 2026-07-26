// @ts-nocheck
import React from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client/react';
import { Form } from 'antd';

import {
  InputTextField,
  SwitchField,
  FormButtonsClose,
} from '/imports/ui/modules/helpers/fields';

import { USER_BY_ID } from '../gql';

const GeneralInfo = ({ history, loading, userById }) => {
  const handleClose = () => {
    history.goBack();
  };

  if (loading) return null;

  return (
    <Form layout="horizontal">
      <InputTextField
        fieldName="userName"
        fieldLabel="User name"
        disabled
        initialValue={userById.username}
      />

      <SwitchField
        fieldName="locked"
        fieldLabel="Locked"
        initialValue={userById.locked}
      />

      <InputTextField
        fieldName="password"
        fieldLabel="Password"
        type="password"
      />

      <InputTextField
        fieldName="email"
        fieldLabel="Google Email"
        initialValue={userById.email}
      />

      <InputTextField
        fieldName="displayName"
        fieldLabel="Display Name"
        initialValue={userById.displayName}
      />

      <InputTextField
        fieldName="personName"
        fieldLabel="Person Name"
        disabled
        initialValue={userById.person ? userById.person.sharedData.name : ''}
      />

      <FormButtonsClose
        handleClose={handleClose}
      />
    </Form>
  );
};

const GeneralInfoWithData = props => {
  const { userId } = props;
  const { data = {}, loading, ...queryResult } = useQuery(USER_BY_ID, {
    variables: { _id: userId },
  });

  return (
    <GeneralInfo
      {...props}
      {...queryResult}
      {...data}
      loading={loading}
    />
  );
};

GeneralInfo.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  loading: PropTypes.bool,
  userId: PropTypes.string,
  userById: PropTypes.object,
};

export default GeneralInfoWithData;
