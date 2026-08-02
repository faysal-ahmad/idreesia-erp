import React, { useState } from 'react';
import { type RouteComponentProps } from 'react-router';
import { useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';

import { useBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import {
  InputFileField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { IMPORT_SECURITY_VISITORS_CSV_DATA } from '../gql';

interface UploadValues {
  csv: string;
}

interface ImportResult {
  imported: number;
  ignored: number;
}

type Props = RouteComponentProps;

const UploadForm = ({ history }: Props) => {
  useBreadcrumbs(['Security', 'Visitor Registration', 'Upload']);

  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [importSecurityVisitorsCsvData] = useMutation(
    IMPORT_SECURITY_VISITORS_CSV_DATA,
    {
      refetchQueries: ['pagedSecurityVisitors'],
    }
  );

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  };

  const handleFinish = ({ csv }: UploadValues) => {
    importSecurityVisitorsCsvData({
      variables: {
        csvData: csv,
      },
    })
      .then((response) => {
        const csvResult = response.data?.importSecurityVisitorsCsvData;
        if (!csvResult) return;
        const result = JSON.parse(csvResult) as ImportResult;
        message.success(
          `${result.imported} records were imported. ${result.ignored} were ignored.`
        );
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      })
      .finally(() => {
        history.goBack();
      });
  };

  return (
    <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <InputFileField
        accept=".csv"
        fieldName="csv"
        fieldLabel="Visitors Data"
        required
        requiredMessage="Select CSV file containing visitor data for upload."
      />
      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

export default UploadForm;
