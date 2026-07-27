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
  query securityMehfilLangarDishById($id: String!) {
    securityMehfilLangarDishById(id: $id) {
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
  mutation updateSecurityMehfilLangarDish($id: String!, $name: String!, $urduName: String!) {
    updateSecurityMehfilLangarDish(id: $id, name: $name, urduName: $urduName) {
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
interface MatchLike { params: { mehfilLangarDishId: string } }
interface EditFormProps { match: MatchLike; history: HistoryLike; }
interface LangarDish { _id: string; name: string; urduName: string; }
interface FormData { securityMehfilLangarDishById: LangarDish; }
interface FormValues { name: string; urduName: string; }

const EditForm = ({ match, history }: EditFormProps) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { mehfilLangarDishId } = match.params;
  const { loading, data } = useQuery(formQuery as any, {
    variables: { id: mehfilLangarDishId },
  });
  const [updateSecurityMehfilLangarDish] = useMutation(formMutation as any, {
    refetchQueries: ['allSecurityMehfilLangarDishes'],
  });
  const securityMehfilLangarDishById = data
    ? (data as FormData).securityMehfilLangarDishById
    : null;

  const handleCancel = () => {
    history.push(paths.mehfilLangarDishesPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, urduName }: FormValues) => {
    if (!securityMehfilLangarDishById) return;
    updateSecurityMehfilLangarDish({
      variables: {
        id: securityMehfilLangarDishById._id,
        name,
        urduName,
      },
    })
      .then(() => {
        history.push(paths.mehfilLangarDishesPath);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (loading || !securityMehfilLangarDishById) return null;

  return (
    <ReactFragment>
      <AntForm layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <TextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={securityMehfilLangarDishById.name}
          required
          requiredMessage="Please input a name for the langar dish."
        />
        <TextField
          fieldName="urduName"
          fieldLabel="Urdu Name"
          initialValue={securityMehfilLangarDishById.urduName}
          required
          requiredMessage="Please input an urdu name for the langar dish."
        />
        <SaveCancelButtons
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </AntForm>
      <AuditInfoComponent record={securityMehfilLangarDishById} />
    </ReactFragment>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Security', 'Mehfil Langar Dishes', 'Edit'])(EditForm as any);
