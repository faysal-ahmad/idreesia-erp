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
  query securityMehfilLangarLocationById($id: String!) {
    securityMehfilLangarLocationById(id: $id) {
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
  mutation updateSecurityMehfilLangarLocation($id: String!, $name: String!, $urduName: String!) {
    updateSecurityMehfilLangarLocation(id: $id, name: $name, urduName: $urduName) {
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
interface MatchLike { params: { mehfilLangarLocationId: string } }
interface EditFormProps { match: MatchLike; history: HistoryLike; }
interface LangarLocation { _id: string; name: string; urduName: string; }
interface FormData { securityMehfilLangarLocationById: LangarLocation; }
interface FormValues { name: string; urduName: string; }

const EditForm = ({ match, history }: EditFormProps) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { mehfilLangarLocationId } = match.params;
  const { loading, data } = useQuery(formQuery as any, {
    variables: { id: mehfilLangarLocationId },
  });
  const [updateSecurityMehfilLangarLocation] = useMutation(formMutation as any, {
    refetchQueries: ['allSecurityMehfilLangarLocations'],
  });
  const securityMehfilLangarLocationById = data
    ? (data as FormData).securityMehfilLangarLocationById
    : null;

  const handleCancel = () => {
    history.push(paths.mehfilLangarLocationsPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, urduName }: FormValues) => {
    if (!securityMehfilLangarLocationById) return;
    updateSecurityMehfilLangarLocation({
      variables: {
        id: securityMehfilLangarLocationById._id,
        name,
        urduName,
      },
    })
      .then(() => {
        history.push(paths.mehfilLangarLocationsPath);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (loading || !securityMehfilLangarLocationById) return null;

  return (
    <ReactFragment>
      <AntForm layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <TextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={securityMehfilLangarLocationById.name}
          required
          requiredMessage="Please input a name for the langar location."
        />
        <TextField
          fieldName="urduName"
          fieldLabel="Urdu Name"
          initialValue={securityMehfilLangarLocationById.urduName}
          required
          requiredMessage="Please input an urdu name for the langar location."
        />
        <SaveCancelButtons
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </AntForm>
      <AuditInfoComponent record={securityMehfilLangarLocationById} />
    </ReactFragment>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Security', 'Mehfil Langar Locations', 'Edit'])(EditForm as any);
