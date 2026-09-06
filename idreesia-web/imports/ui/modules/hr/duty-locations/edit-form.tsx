import React, { useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation, useQuery } from '@apollo/client/react';
import { Collapse, Empty, Form, Spin, type CollapseProps } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { type match } from 'react-router';
import { type History } from 'history';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
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
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const dutyLocationId = match.params.dutyLocationId;
  const { data, loading } = useQuery(DUTY_LOCATION_BY_ID, {
    variables: { id: dutyLocationId },
  });
  const [updateDutyLocation] = useMutation(UPDATE_DUTY_LOCATION, {
    refetchQueries: [
      'listAllDutyLocations',
      'composerAllDutyLocations',
      'dutyLocationById',
    ],
  });
  const dutyLocationById = data?.dutyLocationById;
  const locationName = dutyLocationById?.name?.trim();

  useDynamicBreadcrumbs(['HR', 'Duty Locations', locationName || 'Edit']);

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
        message.success('Duty location updated', 2);
        setIsFieldsTouched(false);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!dutyLocationById?._id) {
    return (
      <Empty
        description="Duty location not found"
        style={{ padding: '80px 0' }}
      />
    );
  }

  const sectionItems: CollapseProps['items'] = [
    {
      key: 'details',
      label: 'Location Details',
      forceRender: true,
      children: (
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={dutyLocationById.name ?? undefined}
          required
          requiredMessage="Please input a name for the duty location."
        />
      ),
    },
  ];

  return (
    <div className="visitor-form">
      <Form
        layout="horizontal"
        onFinish={handleFinish}
        onFieldsChange={handleFieldsChange}
      >
        <Collapse
          className="visitor-form-sections"
          defaultActiveKey={['details']}
          items={sectionItems}
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
          fullWidth
        />
      </Form>
      <AuditInfo record={dutyLocationById} />
    </div>
  );
};

export default EditForm;
