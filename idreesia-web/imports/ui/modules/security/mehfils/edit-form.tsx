import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form, message } from 'antd';
import dayjs from 'dayjs';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  InputTextField,
  DateField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';

import { MEHFIL_BY_ID, UPDATE_MEHFIL, ALL_MEHFILS } from './gql';

const AntForm = Form as any;
const TextField = InputTextField as any;
const FormDateField = DateField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
const AuditInfoComponent = AuditInfo as any;

interface HistoryLike {
  goBack(): void;
}

interface MatchLike {
  params: { mehfilId: string };
}

interface EditFormProps {
  match: MatchLike;
  history: HistoryLike;
}

interface Mehfil {
  _id: string;
  name: string;
  mehfilDate: string | number;
}

interface MehfilData {
  mehfilById?: Mehfil | null;
}

interface MehfilFormValues {
  name: string;
  mehfilDate: string | number | Date;
}

const EditForm = ({ match, history }: EditFormProps) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { mehfilId } = match.params;
  const { loading, data } = useQuery(MEHFIL_BY_ID as any, {
    variables: { _id: mehfilId },
  });
  const [updateMehfil] = useMutation(UPDATE_MEHFIL as any, {
    refetchQueries: [{ query: ALL_MEHFILS as any }],
  });
  const mehfilById = data ? (data as MehfilData).mehfilById : null;

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, mehfilDate }: MehfilFormValues) => {
    if (!mehfilById) return;
    updateMehfil({
      variables: {
        _id: mehfilById._id,
        name,
        mehfilDate,
      },
    })
      .catch((error: Error) => {
        message.error(error.message, 5);
      })
      .finally(() => {
        history.goBack();
      });
  };

  if (loading || !mehfilById) return null;

  return (
    <>
      <AntForm layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <TextField
          fieldName="name"
          fieldLabel="Mehfil Name"
          initialValue={mehfilById.name}
          required
          requiredMessage="Please input a name for the Mehfil."
        />
        <FormDateField
          fieldName="mehfilDate"
          fieldLabel="Mehfil Date"
          initialValue={dayjs(Number(mehfilById.mehfilDate))}
        />
        <SaveCancelButtons
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </AntForm>
      <AuditInfoComponent record={mehfilById} />
    </>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Security', 'Mehfils', 'Edit'])(EditForm as any);
