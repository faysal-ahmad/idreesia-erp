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
  SECURITY_MEHFIL_LANGAR_LOCATION_BY_ID,
  UPDATE_SECURITY_MEHFIL_LANGAR_LOCATION,
} from './gql';

interface EditFormProps {
  match: match<{ mehfilLangarLocationId: string }>;
  history: History;
}

interface FormValues {
  name: string;
  urduName: string;
}

const EditForm = ({ match, history }: EditFormProps) => {
  useBreadcrumbs(['Security', 'Mehfil Langar Locations', 'Edit']);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const mehfilLangarLocationId = match.params.mehfilLangarLocationId;
  const { loading, data } = useQuery(SECURITY_MEHFIL_LANGAR_LOCATION_BY_ID, {
    variables: { id: mehfilLangarLocationId },
  });
  const [updateSecurityMehfilLangarLocation] = useMutation(UPDATE_SECURITY_MEHFIL_LANGAR_LOCATION, {
    refetchQueries: ['allSecurityMehfilLangarLocations'],
  });
  const securityMehfilLangarLocationById = data?.securityMehfilLangarLocationById;

  const handleCancel = () => {
    history.push(paths.mehfilLangarLocationsPath);
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ name, urduName }: FormValues) => {
    if (!securityMehfilLangarLocationById?._id) return;
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
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  if (loading || !securityMehfilLangarLocationById?._id) return null;

  return (
    <Fragment>
      <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={securityMehfilLangarLocationById.name ?? undefined}
          required
          requiredMessage="Please input a name for the langar location."
        />
        <InputTextField
          fieldName="urduName"
          fieldLabel="Urdu Name"
          initialValue={securityMehfilLangarLocationById.urduName ?? undefined}
          required
          requiredMessage="Please input an urdu name for the langar location."
        />
        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={securityMehfilLangarLocationById ?? {}} />
    </Fragment>
  );
};

export default EditForm;
