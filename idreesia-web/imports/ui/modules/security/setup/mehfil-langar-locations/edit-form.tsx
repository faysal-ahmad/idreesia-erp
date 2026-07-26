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

const EditForm = ({ match, history }) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { mehfilLangarLocationId } = match.params;
  const { loading, data } = useQuery(formQuery, {
    variables: { id: mehfilLangarLocationId },
  });
  const [updateSecurityMehfilLangarLocation] = useMutation(formMutation, {
    refetchQueries: ['allSecurityMehfilLangarLocations'],
  });
  const securityMehfilLangarLocationById = data
    ? data.securityMehfilLangarLocationById
    : null;

  const handleCancel = () => {
    history.push(paths.mehfilLangarLocationsPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, urduName }) => {
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
          initialValue={securityMehfilLangarLocationById.name}
          required
          requiredMessage="Please input a name for the langar location."
        />
        <InputTextField
          fieldName="urduName"
          fieldLabel="Urdu Name"
          initialValue={securityMehfilLangarLocationById.urduName}
          required
          requiredMessage="Please input an urdu name for the langar location."
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={securityMehfilLangarLocationById} />
    </Fragment>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Security', 'Mehfil Langar Locations', 'Edit'])(EditForm);
