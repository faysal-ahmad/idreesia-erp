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

const AntForm = Form as any;
const FileField = InputFileField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
interface HistoryLike { goBack(): void; }
interface UploadFormProps { history: HistoryLike; }
interface UploadValues { csv: string; }
interface ImportResult { imported: number; ignored: number; }

const UploadForm = ({ history }: UploadFormProps) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [importSecurityVisitorsCsvData] = useMutation(
    IMPORT_SECURITY_VISITORS_CSV_DATA as any,
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
      .then((response: any) => {
        const result = JSON.parse(response.data.importCsvData) as ImportResult;
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
    <AntForm layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
      <FileField
        accept=".csv"
        fieldName="csv"
        fieldLabel="Visitors Data"
        required
        requiredMessage="Select CSV file containing visitor data for upload."
      />
      <SaveCancelButtons
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </AntForm>
  );
};

UploadForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default flowRight(
  WithBreadcrumbs(['Security', 'Visitor Registration', 'Upload'])
)(UploadForm as any);
