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

const EditForm = ({ match, history }) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { mehfilLangarDishId } = match.params;
  const { loading, data } = useQuery(formQuery, {
    variables: { id: mehfilLangarDishId },
  });
  const [updateSecurityMehfilLangarDish] = useMutation(formMutation, {
    refetchQueries: ['allSecurityMehfilLangarDishes'],
  });
  const securityMehfilLangarDishById = data
    ? data.securityMehfilLangarDishById
    : null;

  const handleCancel = () => {
    history.push(paths.mehfilLangarDishesPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, urduName }) => {
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
          initialValue={securityMehfilLangarDishById.name}
          required
          requiredMessage="Please input a name for the langar dish."
        />
        <InputTextField
          fieldName="urduName"
          fieldLabel="Urdu Name"
          initialValue={securityMehfilLangarDishById.urduName}
          required
          requiredMessage="Please input an urdu name for the langar dish."
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={securityMehfilLangarDishById} />
    </Fragment>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Security', 'Mehfil Langar Dishes', 'Edit'])(EditForm);
