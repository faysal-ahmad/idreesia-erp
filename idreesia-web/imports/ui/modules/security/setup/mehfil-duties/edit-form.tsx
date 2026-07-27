import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form, message } from 'antd';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';

const formQuery = gql`
  query setupSecurityMehfilDutyById($id: String!) {
    securityMehfilDutyById(id: $id) {
      _id
      name
      urduName
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

const formMutation = gql`
  mutation updateSecurityMehfilDuty($id: String!, $name: String!, $urduName: String!) {
    updateSecurityMehfilDuty(id: $id, name: $name, urduName: $urduName) {
      _id
      name
      urduName
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

const ReactFragment = Fragment as any;
const AntForm = Form as any;
const TextField = InputTextField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
const AuditInfoComponent = AuditInfo as any;
interface HistoryLike { push(path: string): void; }
interface MatchLike { params: { mehfilDutyId: string } }
interface EditFormProps { match: MatchLike; history: HistoryLike; }
interface MehfilDuty { _id: string; name: string; urduName: string; }
interface FormData { securityMehfilDutyById: MehfilDuty; }
interface FormValues { name: string; urduName: string; }

const EditForm = ({ match, history }: EditFormProps) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { mehfilDutyId } = match.params;
  const { loading, data } = useQuery(formQuery as any, {
    variables: { id: mehfilDutyId },
  });
  const [updateSecurityMehfilDuty] = useMutation(formMutation as any, {
    refetchQueries: ['allSecurityMehfilDuties'],
  });
  const securityMehfilDutyById = data ? (data as FormData).securityMehfilDutyById : null;

  const handleCancel = () => {
    history.push(paths.mehfilDutiesPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, urduName }: FormValues) => {
    if (!securityMehfilDutyById) return;
    updateSecurityMehfilDuty({
      variables: {
        id: securityMehfilDutyById._id,
        name,
        urduName,
      },
    })
      .then(() => {
        history.push(paths.mehfilDutiesPath);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (loading || !securityMehfilDutyById) return null;

  return (
    <ReactFragment>
      <AntForm layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <TextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={securityMehfilDutyById.name}
          required
          requiredMessage="Please input a name for the mehfil duty."
        />
        <TextField
          fieldName="urduName"
          fieldLabel="Urdu Name"
          initialValue={securityMehfilDutyById.urduName}
          required
          requiredMessage="Please input an urdu name for the mehfil duty."
        />
        <SaveCancelButtons
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </AntForm>
      <AuditInfoComponent record={securityMehfilDutyById} />
    </ReactFragment>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Security', 'Mehfil Duties', 'Edit'])(EditForm as any);
