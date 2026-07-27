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

const AntForm = Form as any;
const TextField = InputTextField as any;
const ToggleField = SwitchField as any;
const CloseButtons = FormButtonsClose as any;

interface HistoryLike {
  goBack(): void;
}

interface PersonRecord {
  sharedData: {
    name?: string;
  };
}

interface UserRecord {
  _id: string;
  username?: string;
  locked?: boolean;
  email?: string;
  displayName?: string;
  person?: PersonRecord | null;
}

interface GeneralInfoProps {
  history: HistoryLike;
  loading?: boolean;
  userById?: UserRecord | null;
}

interface GeneralInfoWithDataProps {
  history: HistoryLike;
  userId?: string | null;
}

interface UserByIdData {
  userById?: UserRecord | null;
}

const GeneralInfo = ({ history, loading, userById }: GeneralInfoProps) => {
  const handleClose = () => {
    history.goBack();
  };

  if (loading || !userById) return null;

  return (
    <AntForm layout="horizontal">
      <TextField
        fieldName="userName"
        fieldLabel="User name"
        disabled
        initialValue={userById.username}
      />

      <ToggleField
        fieldName="locked"
        fieldLabel="Locked"
        initialValue={userById.locked}
      />

      <TextField
        fieldName="password"
        fieldLabel="Password"
        type="password"
      />

      <TextField
        fieldName="email"
        fieldLabel="Google Email"
        initialValue={userById.email}
      />

      <TextField
        fieldName="displayName"
        fieldLabel="Display Name"
        initialValue={userById.displayName}
      />

      <TextField
        fieldName="personName"
        fieldLabel="Person Name"
        disabled
        initialValue={userById.person ? userById.person.sharedData.name : ''}
      />

      <CloseButtons
        handleClose={handleClose}
      />
    </AntForm>
  );
};

const GeneralInfoWithData = (props: GeneralInfoWithDataProps) => {
  const { userId } = props;
  const { data = {}, loading, ...queryResult } = useQuery(USER_BY_ID as any, {
    variables: { _id: userId },
  });

  return (
    <GeneralInfo
      {...props}
      {...queryResult}
      {...(data as UserByIdData)}
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
