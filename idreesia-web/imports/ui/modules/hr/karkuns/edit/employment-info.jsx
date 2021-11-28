import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import moment from 'moment';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  DateField,
  SelectField,
  SwitchField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { WithAllJobs } from '/imports/ui/modules/hr/common/composers';

import { HR_KARKUN_BY_ID, SET_HR_KARKUN_EMPLOYMENT_INFO } from '../gql';

class EmploymentInfo extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,

    formDataLoading: PropTypes.bool,
    karkunId: PropTypes.string,
    hrKarkunById: PropTypes.object,
    allJobs: PropTypes.array,
    allJobsLoading: PropTypes.bool,
    setHrKarkunEmploymentInfo: PropTypes.func,
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

  handleFinish = ({ isEmployee, jobId, employmentStartDate, employmentEndDate }) => {
    const { history, karkunId, setHrKarkunEmploymentInfo } = this.props;
    setHrKarkunEmploymentInfo({
      variables: {
        _id: karkunId,
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
  };

  render() {
    const {
      formDataLoading,
      allJobsLoading,
      hrKarkunById,
      allJobs,
    } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (formDataLoading || allJobsLoading) return null;

    return (
      <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <SwitchField
          fieldName="isEmployee"
          fieldLabel="Is Employee"
          initialValue={hrKarkunById.isEmployee || false}
        />

        <SelectField
          fieldName="jobId"
          fieldLabel="Current Job"
          required={false}
          data={allJobs}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          initialValue={hrKarkunById.jobId}
        />

        <DateField
          fieldName="employmentStartDate"
          fieldLabel="Start Date"
          initialValue={
            hrKarkunById.employmentStartDate
              ? moment(Number(hrKarkunById.employmentStartDate))
              : null
          }
        />

        <DateField
          fieldName="employmentEndDate"
          fieldLabel="End Date"
          initialValue={
            hrKarkunById.employmentEndDate
              ? moment(Number(hrKarkunById.employmentEndDate))
              : null
          }
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
  graphql(SET_HR_KARKUN_EMPLOYMENT_INFO, {
    name: 'setHrKarkunEmploymentInfo',
    options: {
      refetchQueries: ['pagedHrKarkuns', 'allJobs'],
    },
  }),
  graphql(HR_KARKUN_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    },
  }),
  WithAllJobs()
)(EmploymentInfo);
