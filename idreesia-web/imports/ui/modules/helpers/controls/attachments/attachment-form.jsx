import React from 'react';
import PropTypes from 'prop-types';

import { Form } from '/imports/ui/controls';

import { InputTextField } from '/imports/ui/modules/helpers/fields';

const AttachmentForm = props => {
  const { defaultValues } = props;

  return (
    <Form layout="horizontal">
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

export default Form.create()(AttachmentForm);
