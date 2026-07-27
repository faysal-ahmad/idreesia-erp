import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';

import {
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { SECURITY_VISITOR_BY_ID, UPDATE_SECURITY_VISITOR_NOTES } from '../gql';

const AntForm = Form as any;
const TextAreaField = InputTextAreaField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
interface HistoryLike { push(path: string): void; }
interface VisitorRecord { _id: string; criminalRecord?: string; otherNotes?: string; }
interface NotesValues { criminalRecord?: string; otherNotes?: string; }
interface NotesProps { history: HistoryLike; loading?: boolean; securityVisitorById?: VisitorRecord | null; }
interface NotesWithDataProps { match: { params: { visitorId: string } }; history: HistoryLike; [key: string]: any; }
interface VisitorData { securityVisitorById?: VisitorRecord | null; }

const Notes = ({ history, loading, securityVisitorById }: NotesProps) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [updateSecurityVisitorNotes] = useMutation(
    UPDATE_SECURITY_VISITOR_NOTES as any,
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
    if (!securityVisitorById) return;
    updateSecurityVisitorNotes({
      variables: {
        _id: securityVisitorById._id,
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

  if (loading || !securityVisitorById) return null;

  return (
    <AntForm layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <TextAreaField
        fieldName="criminalRecord"
        fieldLabel="Criminal Record"
        initialValue={securityVisitorById.criminalRecord}
        required={false}
      />

      <TextAreaField
        fieldName="otherNotes"
        fieldLabel="Other Notes"
        initialValue={securityVisitorById.otherNotes}
        required={false}
      />

      <SaveCancelButtons
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </AntForm>
  );
};

const NotesWithData = (props: NotesWithDataProps) => {
  const { match } = props;
  const { visitorId } = match.params;
  const { data = {}, loading, ...queryResult } = useQuery(SECURITY_VISITOR_BY_ID as any, {
    variables: { _id: visitorId },
  });

  return (
    <Notes
      {...props}
      {...queryResult}
      {...(data as VisitorData)}
      loading={loading}
    />
  );
};

Notes.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  loading: PropTypes.bool,
  visitorId: PropTypes.string,
  securityVisitorById: PropTypes.object,
};

export default NotesWithData;
