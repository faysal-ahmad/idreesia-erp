import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  InputFileField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { IMPORT_SECURITY_VISITORS_CSV_DATA } from '../gql';

class UploadForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    importSecurityVisitorsCsvData: PropTypes.func,
  };
  
  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ csv }) => {
    const { importSecurityVisitorsCsvData, history } = this.props;
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

  render() {
    const isFieldsTouched = this.state.isFieldsTouched;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <InputFileField
          accept=".csv"
          fieldName="csv"
          fieldLabel="Visitors Data"
          required
          requiredMessage="Select CSV file containing visitor data for upload."
        />
        <FormButtonsSaveCancel
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

export default flowRight(
  graphql(IMPORT_SECURITY_VISITORS_CSV_DATA, {
    name: 'importSecurityVisitorsCsvData',
    options: {
      refetchQueries: ['pagedSecurityVisitors'],
    },
  }),
  WithBreadcrumbs(['Security', 'Visitor Registration', 'Upload'])
)(UploadForm);
