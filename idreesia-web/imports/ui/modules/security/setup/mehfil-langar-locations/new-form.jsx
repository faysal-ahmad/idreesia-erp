import React, { useState } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

const formMutation = gql`
  mutation createSecurityMehfilLangarLocation($name: String!, $urduName: String!) {
    createSecurityMehfilLangarLocation(name: $name, urduName: $urduName) {
      _id
      name
      urduName
    }
  }
`;

const NewForm = ({ history }) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createSecurityMehfilLangarLocation] = useMutation(formMutation, {
    refetchQueries: ['allSecurityMehfilLangarLocations'],
  });

  const handleCancel = () => {
    history.push(paths.mehfilLangarLocationsPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = fieldsValue => {
    createSecurityMehfilLangarLocation({
      variables: {
        name: fieldsValue.name,
        urduName: fieldsValue.urduName,
      },
    })
      .then(() => {
        history.push(paths.mehfilLangarLocationsPath);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="name"
        fieldLabel="Name"
        required
        requiredMessage="Please input a name for the langar location."
      />
      <InputTextField
        fieldName="urduName"
        fieldLabel="Urdu Name"
        required
        requiredMessage="Please input an urdu name for the langar location."
      />
      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

NewForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Security', 'Mehfil Langar Locations', 'New'])(NewForm);
