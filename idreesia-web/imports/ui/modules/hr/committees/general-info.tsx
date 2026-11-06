import React, { useState } from 'react';
import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import { Collapse, Form, type CollapseProps } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { type History } from 'history';

import type {
  CommitteeByIdQuery,
  UpdateCommitteeMutation,
  UpdateCommitteeMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';
import {
  ColorField,
  InputTextField,
  InputTextAreaField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

import { type CommitteeFormValues } from './committee-form';

const UPDATE_COMMITTEE: TypedDocumentNode<
  UpdateCommitteeMutation,
  UpdateCommitteeMutationVariables
> = gql`
  mutation updateCommittee(
    $id: String!
    $name: String!
    $color: String
    $description: String
  ) {
    updateCommittee(
      id: $id
      name: $name
      color: $color
      description: $description
    ) {
      _id
      name
    }
  }
`;

interface Props {
  history: History;
  committeeId: string;
  committee: NonNullable<CommitteeByIdQuery['committeeById']>;
}

const GeneralInfo = ({ history, committeeId, committee }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [updateCommittee] = useMutation(UPDATE_COMMITTEE, {
    refetchQueries: ['listAllCommittees', 'committeeById'],
  });

  const handleCancel = () => {
    history.push(paths.committeesPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, color, description }: CommitteeFormValues) => {
    updateCommittee({
      variables: {
        id: committeeId,
        name,
        color,
        description,
      },
    })
      .then(() => {
        message.success('Committee updated', 2);
        setIsFieldsTouched(false);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  const sectionItems: CollapseProps['items'] = [
    {
      key: 'details',
      label: 'Committee Details',
      forceRender: true,
      children: (
        <>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={committee.name ?? undefined}
            required
            requiredMessage="Please input a name for the committee."
          />
          <ColorField
            fieldName="color"
            fieldLabel="Color"
            initialValue={committee.color}
          />
          <InputTextAreaField
            fieldName="description"
            fieldLabel="Description"
            initialValue={committee.description ?? undefined}
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
      <AuditInfo record={committee} />
    </div>
  );
};

export default GeneralInfo;
