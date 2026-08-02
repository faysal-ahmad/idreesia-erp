import React, { useState } from 'react';
import { type History } from 'history';
import { useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';

import type { SecurityRegistrationVisitorByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import {
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { UPDATE_SECURITY_VISITOR_NOTES } from '../gql';

type SecurityVisitor = NonNullable<
  SecurityRegistrationVisitorByIdQuery['securityVisitorById']
>;

interface NotesValues {
  criminalRecord?: string;
  otherNotes?: string;
}

interface Props {
  history: History;
  securityVisitorById: SecurityVisitor;
}

const Notes = ({ history, securityVisitorById }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [updateSecurityVisitorNotes] = useMutation(
    UPDATE_SECURITY_VISITOR_NOTES,
    {
      refetchQueries: ['pagedSecurityVisitors'],
    }
  );

  const handleCancel = () => {
    history.push(`${paths.visitorRegistrationPath}`);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ criminalRecord, otherNotes }: NotesValues) => {
    updateSecurityVisitorNotes({
      variables: {
        _id: securityVisitorById._id ?? '',
        criminalRecord,
        otherNotes,
      },
    })
      .then(() => {
        history.push(`${paths.visitorRegistrationPath}`);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputTextAreaField
        fieldName="criminalRecord"
        fieldLabel="Criminal Record"
        initialValue={securityVisitorById.criminalRecord}
        required={false}
      />

      <InputTextAreaField
        fieldName="otherNotes"
        fieldLabel="Other Notes"
        initialValue={securityVisitorById.otherNotes}
        required={false}
      />

      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

export default Notes;
