import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { JobTypes } from 'meteor/idreesia-common/constants';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Form, message } from '/imports/ui/controls';
import { WithCompanies } from '/imports/ui/modules/accounts/common/composers';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';
import {
  SelectField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import { WithAdminJobsMutation } from './composers';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    companiesListLoading: PropTypes.bool,
    allCompanies: PropTypes.array,
    createAdminJob: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.adminJobsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createAdminJob, history } = this.props;
    form.validateFields((err, { companyId }) => {
      if (err) return;
      const jobType = JobTypes.ACCOUNTS_IMPORT;
      const jobDetails = { companyId };
      createAdminJob({
        variables: {
          jobType,
          jobDetails: JSON.stringify(jobDetails),
        },
      })
        .then(() => {
          history.push(paths.adminJobsPath);
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const { isFieldsTouched } = this.props.form;
    const { allCompanies } = this.props;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <SelectField
          data={allCompanies}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="companyId"
          fieldLabel="Company"
          required
          requiredMessage="Please select a company."
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
  Form.create(),
  WithCompanies(),
  WithAdminJobsMutation(),
  WithBreadcrumbs(['Admin', 'Admin Jobs', 'New Accounts Import'])
)(NewForm);
