import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';

import { InputTextField } from '/imports/ui/modules/helpers/fields';

const AttachmentForm = props => {
  const { form, defaultValues } = props;

  return (
    <Form form={form} layout="horizontal">
      <InputTextField
        fieldName="name"
        fieldLabel="Name"
        initialValue={defaultValues.name}
      />

      <InputTextField
        fieldName="description"
        fieldLabel="Description"
        initialValue={defaultValues.description}
      />
    </Form>
  );
};

AttachmentForm.propTypes = {
  form: PropTypes.object,
  defaultValues: PropTypes.object,
};

export default AttachmentForm;
