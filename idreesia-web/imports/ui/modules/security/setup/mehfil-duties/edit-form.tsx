// @ts-nocheck
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
  query securityMehfilDutyById($id: String!) {
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

const EditForm = ({ match, history }) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { mehfilDutyId } = match.params;
  const { loading, data } = useQuery(formQuery, {
    variables: { id: mehfilDutyId },
  });
  const [updateSecurityMehfilDuty] = useMutation(formMutation, {
    refetchQueries: ['allSecurityMehfilDuties'],
  });
  const securityMehfilDutyById = data ? data.securityMehfilDutyById : null;

  const handleCancel = () => {
    history.push(paths.mehfilDutiesPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, urduName }) => {
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
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  if (loading) return null;

  return (
    <Fragment>
      <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={securityMehfilDutyById.name}
          required
          requiredMessage="Please input a name for the mehfil duty."
        />
        <InputTextField
          fieldName="urduName"
          fieldLabel="Urdu Name"
          initialValue={securityMehfilDutyById.urduName}
          required
          requiredMessage="Please input an urdu name for the mehfil duty."
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={securityMehfilDutyById} />
    </Fragment>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Security', 'Mehfil Duties', 'Edit'])(EditForm);
