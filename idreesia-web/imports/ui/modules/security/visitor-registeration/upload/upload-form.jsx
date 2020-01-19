import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import {
  InputFileField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class UploadForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    importCsvData: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, importCsvData, history } = this.props;
    form.validateFields((err, { csv }) => {
      if (err) return;

      importCsvData({
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
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputFileField
          accept=".csv"
          fieldName="csv"
          fieldLabel="Visitors Data"
          required
          requiredMessage="Select CSV file containing visitor data for upload."
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const importCsvDataMutation = gql`
  mutation importCsvData($csvData: String!) {
    importCsvData(csvData: $csvData)
  }
`;

export default flowRight(
  Form.create(),
  graphql(importCsvDataMutation, {
    name: 'importCsvData',
    options: {
      refetchQueries: ['pagedVisitors'],
    },
  }),
  WithBreadcrumbs(['Security', 'Visitor Registration', 'Upload'])
)(UploadForm);
