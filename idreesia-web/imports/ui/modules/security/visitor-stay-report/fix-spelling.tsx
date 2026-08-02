import React, { useState } from 'react';
import { Form } from 'antd';

import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

interface FixSpellingProps {
  spellingType: string;
  existingSpelling: string;
  onSave(spellingType: string, existingSpelling: string, newSpelling: string): void;
  onCancel(): void;
}

interface FixSpellingValues {
  existingSpelling: string;
  newSpelling: string;
}

const FixSpelling = ({
  spellingType,
  existingSpelling,
  onSave,
  onCancel,
}: FixSpellingProps) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ existingSpelling: existing, newSpelling }: FixSpellingValues) => {
    onSave(spellingType, existing, newSpelling);
  };

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextField
        fieldName="existingSpelling"
        fieldLabel="Existing Spelling"
        initialValue={existingSpelling}
        disabled
      />

      <InputTextField
        fieldName="newSpelling"
        fieldLabel="New Spelling"
        required
      />

      <FormButtonsSaveCancel
        handleCancel={onCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

export default FixSpelling;
