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

const Notes = ({ history, loading, securityVisitorById }) => {
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

  const handleFinish = ({ criminalRecord, otherNotes }) => {
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
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  if (loading) return null;

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

const NotesWithData = props => {
  const { match } = props;
  const { visitorId } = match.params;
  const { data = {}, loading, ...queryResult } = useQuery(SECURITY_VISITOR_BY_ID, {
    variables: { _id: visitorId },
  });

  return (
    <Notes
      {...props}
      {...queryResult}
      {...data}
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
