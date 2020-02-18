import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import moment from 'moment';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Form, message } from '/imports/ui/controls';
import {
  DateField,
  SelectField,
  SwitchField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { WithAllJobs } from '/imports/ui/modules/hr/common/composers';

import { KARKUN_BY_ID, SET_KARKUN_EMPLOYMENT_INFO } from '../gql';

class EmploymentInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    formDataLoading: PropTypes.bool,
    karkunId: PropTypes.string,
    karkunById: PropTypes.object,
    allJobs: PropTypes.array,
    allJobsLoading: PropTypes.bool,
    setKarkunEmploymentInfo: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, karkunById, setKarkunEmploymentInfo } = this.props;
    form.validateFields(
      (err, { isEmployee, jobId, employmentStartDate, employmentEndDate }) => {
        if (err) return;

        setKarkunEmploymentInfo({
          variables: {
            _id: karkunById._id,
            isEmployee,
            jobId,
            employmentStartDate,
            employmentEndDate,
          },
        })
          .then(() => {
            history.goBack();
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  render() {
    const { formDataLoading, allJobsLoading, karkunById, allJobs } = this.props;
    const { getFieldDecorator } = this.props.form;
    if (formDataLoading || allJobsLoading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <SwitchField
          fieldName="isEmployee"
          fieldLabel="Is Employee"
          initialValue={karkunById.isEmployee || false}
          getFieldDecorator={getFieldDecorator}
        />

        <SelectField
          fieldName="jobId"
          fieldLabel="Current Job"
          required={false}
          data={allJobs}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          initialValue={karkunById.jobId}
          getFieldDecorator={getFieldDecorator}
        />

        <DateField
          fieldName="employmentStartDate"
          fieldLabel="Start Date"
          initialValue={
            karkunById.employmentStartDate
              ? moment(Number(karkunById.employmentStartDate))
              : null
          }
          getFieldDecorator={getFieldDecorator}
        />

        <DateField
          fieldName="employmentEndDate"
          fieldLabel="End Date"
          initialValue={
            karkunById.employmentEndDate
              ? moment(Number(karkunById.employmentEndDate))
              : null
          }
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

export default flowRight(
  Form.create(),
  graphql(SET_KARKUN_EMPLOYMENT_INFO, {
    name: 'setKarkunEmploymentInfo',
    options: {
      refetchQueries: ['pagedKarkuns', 'allJobs'],
    },
  }),
  graphql(KARKUN_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    },
  }),
  WithAllJobs()
)(EmploymentInfo);
