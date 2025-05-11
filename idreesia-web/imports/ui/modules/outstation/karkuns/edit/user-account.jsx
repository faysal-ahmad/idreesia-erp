import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import { useMutation } from '@apollo/react-hooks';

import { useAllPortals } from 'meteor/idreesia-common/hooks/portals';
import {
  InputTextField,
  FormButtonsSubmit,
} from '/imports/ui/modules/helpers/fields';

import { CREATE_OUTSTATION_KARKUN_USER_ACCOUNT } from '../gql';

const UserAccount = ({
  karkunId,
  outstationKarkunById,
  refetchKarkun,
}) => {
  const [createAccountForm] = Form.useForm();
  const [updateAccountForm] = Form.useForm();
  const [isCreateAccountFieldsTouched, setIsCreateAccountFieldsTouched] = useState(false);
  const [isUpdateAccountFieldsTouched, setIsUpdateAccountFieldsTouched] = useState(false);
  const [createOutstationKarkunUserId] = useMutation(CREATE_OUTSTATION_KARKUN_USER_ACCOUNT);

  const { allPortals, allPortalsLoading } = useAllPortals();
  if (allPortalsLoading) return null;

  const handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  const handleCreateAccountFieldsChange = () => {
    setIsCreateAccountFieldsTouched(true);
  }

  const handleUpdateAccountFieldsChange = () => {
    setIsUpdateAccountFieldsTouched(true);
  }

  const handleFinishCreateAccount = ({ email }) => {
      return createOutstationKarkunUserId({
        variables: {
          _id: karkunId,
          email,
        }
      })
      .then(() => {
        createAccountForm.resetFields();
        message.success('An email has been sent to the specified email address with further instructions.');
        refetchKarkun();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  
  };

  const handleFinishUpdateAccount = () => { }

  if (allPortalsLoading) return null;

  const portalsData = allPortals.map(portal => ({
    value: portal._id,
    text: portal.name,
  }));

  const { user } = outstationKarkunById;
  // Show option to create a user account for the karkun
  // if one does not yet exist
  if (!user) {
    return (
      <Form
        form={createAccountForm}
        layout="horizontal"
        onFinish={handleFinishCreateAccount}
        onFieldsChange={handleCreateAccountFieldsChange}
      >
        <InputTextField
          fieldName="email"
          fieldLabel="Email"
          required
          requiredMessage="Please input the email for the karkun."
          disabled={!!outstationKarkunById.user?.email}
          initialValue={outstationKarkunById.user?.email}
        />
  
        <FormButtonsSubmit
          text="Create Account"
          isFieldsTouched={isCreateAccountFieldsTouched}
        />
      </Form>
    );
  }

  return (
    <Form
      form={updateAccountForm}
      layout="horizontal"
      onFinish={handleFinishUpdateAccount}
      onFieldsChange={handleUpdateAccountFieldsChange}
    >
      <InputTextField
        fieldName="email"
        fieldLabel="Email"
        disabled={!!user.email}
        initialValue={user.email}
      />
    </Form>
  );
}

UserAccount.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  karkunId: PropTypes.string,
  outstationKarkunById: PropTypes.object,
  refetchKarkun: PropTypes.func,
};

export default UserAccount;
