import React, { useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { Collapse, Form, type CollapseProps } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { type History } from 'history';

import type {
  DutyByIdQuery,
  UpdateDutyMutation,
  UpdateDutyMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import {
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

const UPDATE_DUTY: TypedDocumentNode<
  UpdateDutyMutation,
  UpdateDutyMutationVariables
> = gql`
  mutation updateDuty(
    $id: String!
    $name: String!
    $description: String
    $attendanceSheet: String
  ) {
    updateDuty(
      id: $id
      name: $name
      description: $description
      attendanceSheet: $attendanceSheet
    ) {
      _id
      name
      description
      attendanceSheet
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

type Duty = NonNullable<DutyByIdQuery['dutyById']>;

interface Props {
  dutyId: string;
  duty: Duty;
  history: History;
}

interface FormValues {
  name: string;
  description?: string;
  attendanceSheet?: string;
}

const GeneralInfo = ({ dutyId, duty, history }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [updateDuty] = useMutation(UPDATE_DUTY, {
    refetchQueries: ['listAllMSDuties', 'allMSDuties', 'dutyById'],
  });

  const handleCancel = () => {
    history.push(paths.msDutiesPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, description, attendanceSheet }: FormValues) => {
    updateDuty({
      variables: {
        id: dutyId,
        name,
        description,
        attendanceSheet,
      },
    })
      .then(() => {
        message.success('Duty updated', 2);
        setIsFieldsTouched(false);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const sectionItems: CollapseProps['items'] = [
    {
      key: 'details',
      label: 'Duty Details',
      forceRender: true,
      children: (
        <>
          <InputTextField
            fieldName="name"
            fieldLabel="Duty Name"
            initialValue={duty.name ?? undefined}
            required
            requiredMessage="Please input a name for the duty."
          />
          <InputTextAreaField
            fieldName="description"
            fieldLabel="Description"
            initialValue={duty.description ?? undefined}
          />
          <InputTextField
            fieldName="attendanceSheet"
            fieldLabel="Attendance Sheet"
            initialValue={duty.attendanceSheet ?? undefined}
          />
        </>
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
      <AuditInfo record={duty} />
    </div>
  );
};

export default GeneralInfo;
