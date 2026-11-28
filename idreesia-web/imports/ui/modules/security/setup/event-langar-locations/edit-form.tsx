import React, { Fragment, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { type match } from 'react-router';
import { type History } from 'history';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';

import {
  SECURITY_EVENT_LANGAR_LOCATION_BY_ID,
  UPDATE_SECURITY_EVENT_LANGAR_LOCATION,
} from './gql';

interface EditFormProps {
  match: match<{ eventLangarLocationId: string }>;
  history: History;
}

interface FormValues {
  name: string;
  urduName: string;
}

const EditForm = ({ match, history }: EditFormProps) => {
  useBreadcrumbs(['Security', 'Event Langar Locations', 'Edit']);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const eventLangarLocationId = match.params.eventLangarLocationId;
  const { loading, data } = useQuery(SECURITY_EVENT_LANGAR_LOCATION_BY_ID, {
    variables: { id: eventLangarLocationId },
  });
  const [updateSecurityEventLangarLocation] = useMutation(UPDATE_SECURITY_EVENT_LANGAR_LOCATION, {
    refetchQueries: ['allSecurityEventLangarLocations'],
  });
  const securityEventLangarLocationById = data?.securityEventLangarLocationById;

  const handleCancel = () => {
    history.push(paths.eventLangarLocationsPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, urduName }: FormValues) => {
    if (!securityEventLangarLocationById?._id) return;
    updateSecurityEventLangarLocation({
      variables: {
        id: securityEventLangarLocationById._id,
        name,
        urduName,
      },
    })
      .then(() => {
        history.push(paths.eventLangarLocationsPath);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (loading || !securityEventLangarLocationById?._id) return null;

  return (
    <Fragment>
      <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={securityEventLangarLocationById.name ?? undefined}
          required
          requiredMessage="Please input a name for the langar location."
        />
        <InputTextField
          fieldName="urduName"
          fieldLabel="Urdu Name"
          initialValue={securityEventLangarLocationById.urduName ?? undefined}
          required
          requiredMessage="Please input an urdu name for the langar location."
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={securityEventLangarLocationById ?? {}} />
    </Fragment>
  );
};

export default EditForm;
