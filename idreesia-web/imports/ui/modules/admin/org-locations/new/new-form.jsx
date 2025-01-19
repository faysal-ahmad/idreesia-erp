import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/react-hooks';
import { Form, message } from 'antd';

import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { CREATE_ORG_LOCATION } from '../gql';

const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 12 },
};

export const NewForm = ({ parentOrgLocation, newOrgLocationType, onClose  }) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [createOrgLocation] = useMutation(CREATE_ORG_LOCATION);

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  }

  const handleFinish = ({ name }) => {
    createOrgLocation({
      variables: {
        name,
        type: newOrgLocationType,
        parentId: parentOrgLocation._id,
      },
    })
      .then(() => {
        onClose(true);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  }

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="parentLocation"
        fieldLabel="Parent Organization Location"
        fieldLayout={formItemLayout}
        initialValue={parentOrgLocation.name}
        disabled
      />

      <InputTextField
        fieldName="name"
        fieldLabel={`New ${newOrgLocationType} Name`}
        fieldLayout={formItemLayout}
        required
      />

      <FormButtonsSaveCancel
        handleCancel={() => { onClose(false) }}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
}

NewForm.propTypes = {
  parentOrgLocation: PropTypes.object,
  newOrgLocationType: PropTypes.string,
  onClose: PropTypes.func,
};