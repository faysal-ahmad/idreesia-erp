import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/client/react';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  InputFileField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { IMPORT_SECURITY_VISITORS_CSV_DATA } from '../gql';

const UploadForm = ({ history }) => {
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

  const handleFinish = ({ csv }) => {
    importSecurityVisitorsCsvData({
      variables: {
        csvData: csv,
      },
    })
      .then(response => {
        const result = JSON.parse(response.data.importCsvData);
        message.success(
          `${result.imported} records were imported. ${result.ignored} were ignored.`
        );
      })
      .catch(error => {
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

UploadForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default flowRight(
  WithBreadcrumbs(['Security', 'Visitor Registration', 'Upload'])
)(UploadForm);
