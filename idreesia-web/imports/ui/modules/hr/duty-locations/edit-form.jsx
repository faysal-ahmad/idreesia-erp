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

const EditForm = ({ match, history }) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const { dutyLocationId } = match.params;
  const { data, loading } = useQuery(formQuery, {
    variables: { id: dutyLocationId },
  });
  const [updateDutyLocation] = useMutation(formMutation, {
    refetchQueries: ['allDutyLocations'],
  });
  const { dutyLocationById } = data || {};

  const handleCancel = () => {
    history.push(paths.dutyLocationsPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name }) => {
    updateDutyLocation({
      variables: {
        id: dutyLocationById._id,
        name,
      },
    })
      .then(() => {
        history.push(paths.dutyLocationsPath);
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  if (loading || !dutyLocationById) return null;

  return (
    <Fragment>
      <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={dutyLocationById.name}
          required
          requiredMessage="Please input a name for the duty location."
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={dutyLocationById} />
    </Fragment>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['HR', 'Duty Locations', 'Edit'])(EditForm);
