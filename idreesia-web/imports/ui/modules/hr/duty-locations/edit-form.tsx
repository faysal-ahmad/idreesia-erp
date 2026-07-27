import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form, message } from 'antd';

import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';

const formQuery = gql`
  query dutyLocationById($id: String!) {
    dutyLocationById(id: $id) {
      _id
      name
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

const formMutation = gql`
  mutation updateDutyLocation($id: String!, $name: String!) {
    updateDutyLocation(id: $id, name: $name) {
      _id
      name
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
interface MatchLike { params: Record<string, string>; }
interface EditFormProps { match: MatchLike; history: HistoryLike; }
interface RecordData { _id: string; name: string; description?: string; }
interface QueryData { dutyLocationById?: RecordData | null; }
interface FormValues { name: string; description?: string; }

const EditForm = ({ match, history }: EditFormProps) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { dutyLocationId } = match.params;
  const { data, loading } = useQuery(formQuery as any, {
    variables: { id: dutyLocationId },
  });
  const [updateDutyLocation] = useMutation(formMutation as any, {
    refetchQueries: ['allDutyLocations'],
  });
  const { dutyLocationById } = (data ?? {}) as QueryData;

  const handleCancel = () => {
    history.push(paths.dutyLocationsPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name }: FormValues) => {
    if (!dutyLocationById) return;
    updateDutyLocation({
      variables: {
        id: dutyLocationById._id,
        name,
      },
    })
      .then(() => {
        history.push(paths.dutyLocationsPath);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (loading || !dutyLocationById) return null;

  return (
    <ReactFragment>
      <AntForm layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <TextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={dutyLocationById.name}
          required
          requiredMessage="Please input a name for the duty location."
        />
        <SaveCancelButtons
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </AntForm>
      <AuditInfoComponent record={dutyLocationById} />
    </ReactFragment>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['HR', 'Duty Locations', 'Edit'])(EditForm as any);
