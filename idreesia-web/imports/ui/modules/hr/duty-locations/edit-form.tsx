import React, { Fragment, useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { type match } from 'react-router';
import { type History } from 'history';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import type {
  DutyLocationByIdQuery,
  DutyLocationByIdQueryVariables,
  UpdateDutyLocationMutation,
  UpdateDutyLocationMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

const DUTY_LOCATION_BY_ID: TypedDocumentNode<
  DutyLocationByIdQuery,
  DutyLocationByIdQueryVariables
> = gql`
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

const UPDATE_DUTY_LOCATION: TypedDocumentNode<
  UpdateDutyLocationMutation,
  UpdateDutyLocationMutationVariables
> = gql`
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

interface EditFormProps {
  match: match<{ dutyLocationId: string }>;
  history: History;
}

interface FormValues {
  name: string;
}

const EditForm = ({ match, history }: EditFormProps) => {
  useBreadcrumbs(['HR', 'Duty Locations', 'Edit']);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const dutyLocationId = match.params.dutyLocationId;
  const { data, loading } = useQuery(DUTY_LOCATION_BY_ID, {
    variables: { id: dutyLocationId },
  });
  const [updateDutyLocation] = useMutation(UPDATE_DUTY_LOCATION, {
    refetchQueries: ['allDutyLocations'],
  });
  const dutyLocationById = data?.dutyLocationById;

  const handleCancel = () => {
    history.push(paths.dutyLocationsPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name }: FormValues) => {
    if (!dutyLocationById?._id) return;
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

  if (loading || !dutyLocationById?._id) return null;

  return (
    <Fragment>
      <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={dutyLocationById.name ?? undefined}
          required
          requiredMessage="Please input a name for the duty location."
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={dutyLocationById ?? {}} />
    </Fragment>
  );
};

export default EditForm;
