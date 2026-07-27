import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'antd';

import {
  InputTextField,
  InputTextAreaField,
} from '/imports/ui/modules/helpers/fields';

const AntForm = Form as any;
const TextField = InputTextField as any;
const TextAreaField = InputTextAreaField as any;
interface AttachmentValues { name?: string; description?: string; }
interface Props { form?: unknown; defaultValues?: AttachmentValues; }

const AttachmentForm = ({ form, defaultValues = {} }: Props) => {

  return (
    <AntForm form={form} layout="horizontal">
      <TextField
        fieldName="name"
        fieldLabel="Name"
        initialValue={defaultValues.name}
      />

      <TextAreaField
        fieldName="description"
        fieldLabel="Description"
        initialValue={defaultValues.description}
      />
    </AntForm>
  );
};

AttachmentForm.propTypes = {
  form: PropTypes.object,
  defaultValues: PropTypes.object,
};

export default AttachmentForm;
