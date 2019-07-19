import React, { Component } from "react";
import PropTypes from "prop-types";
import { Form, message } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";
import moment from "moment";

import {
  DateField,
  InputNumberField,
  SelectField,
  SwitchField,
  FormButtonsSaveCancel,
} from "/imports/ui/modules/helpers/fields";

import { WithAllJobs } from "/imports/ui/modules/hr/common/composers";

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
      (
        err,
        {
          isEmployee,
          jobId,
          employmentStartDate,
          employmentEndDate,
          currentSalary,
        }
      ) => {
        if (err) return;

        setKarkunEmploymentInfo({
          variables: {
            _id: karkunById._id,
            isEmployee,
            jobId,
            employmentStartDate,
            employmentEndDate,
            currentSalary,
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
          initialValue={karkunById.isEmployee}
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

        <InputNumberField
          fieldName="currentSalary"
          fieldLabel="Current Salary"
          initialValue={karkunById.currentSalary}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formQuery = gql`
  query karkunById($_id: String!) {
    karkunById(_id: $_id) {
      _id
      isEmployee
      jobId
      employmentStartDate
      employmentEndDate
      currentSalary
    }
  }
`;

const formMutation = gql`
  mutation setKarkunEmploymentInfo(
    $_id: String!
    $isEmployee: Boolean!
    $jobId: String
    $employmentStartDate: String!
    $employmentEndDate: String
    $currentSalary: Float
  ) {
    setKarkunEmploymentInfo(
      _id: $_id
      isEmployee: $isEmployee
      jobId: $jobId
      employmentStartDate: $employmentStartDate
      employmentEndDate: $employmentEndDate
      currentSalary: $currentSalary
    ) {
      _id
      isEmployee
      jobId
      employmentStartDate
      employmentEndDate
      currentSalary
    }
  }
`;

export default compose(
  Form.create(),
  graphql(formMutation, {
    name: "setKarkunEmploymentInfo",
    options: {
      refetchQueries: ["pagedKarkuns"],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { karkunId } = match.params;
      return { variables: { _id: karkunId } };
    },
  }),
  WithAllJobs()
)(EmploymentInfo);
