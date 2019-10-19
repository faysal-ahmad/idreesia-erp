import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  Button,
  Collapse,
  Form,
  Icon,
  Row,
  Tooltip,
} from '/imports/ui/controls';
import {
  CheckboxField,
  InputCnicField,
  InputTextField,
  CascaderField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';
import { getDutyShiftCascaderData } from '/imports/ui/modules/hr/common/utilities';

const ContainerStyle = {
  width: '500px',
};

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 },
};

const buttonItemLayout = {
  wrapperCol: { span: 12, offset: 4 },
};

class ListFilter extends Component {
  static propTypes = {
    form: PropTypes.object,
    allJobs: PropTypes.array,
    allDuties: PropTypes.array,
    allDutyShifts: PropTypes.array,
    allJobsLoading: PropTypes.bool,
    allDutiesLoading: PropTypes.bool,
    allDutyShiftsLoading: PropTypes.bool,
    name: PropTypes.string,
    cnicNumber: PropTypes.string,
    phoneNumber: PropTypes.string,
    bloodGroup: PropTypes.string,
    jobId: PropTypes.string,
    dutyId: PropTypes.string,
    shiftId: PropTypes.string,
    showVolunteers: PropTypes.string,
    showEmployees: PropTypes.string,
    setPageParams: PropTypes.func,
    refreshData: PropTypes.func,
  };

  static defaultProps = {
    cnicNumber: '',
    filterCriteria: {},
  };

  handleReset = () => {
    const { form, setPageParams } = this.props;
    form.resetFields();
    setPageParams({
      pageIndex: 0,
      name: null,
      cnicNumber: null,
      phoneNumber: null,
      bloodGroup: null,
      jobId: null,
      dutyId: null,
      shiftId: null,
      karkunType: ['volunteers', 'employees'],
    });
  };

  handleSubmit = () => {
    const { form, setPageParams } = this.props;

    form.validateFields(
      (
        err,
        {
          name,
          cnicNumber,
          phoneNumber,
          bloodGroup,
          jobId,
          dutyIdShiftId,
          karkunType,
        }
      ) => {
        if (err) return;
        setPageParams({
          pageIndex: 0,
          name,
          cnicNumber,
          phoneNumber,
          bloodGroup,
          jobId,
          dutyId: dutyIdShiftId[0],
          shiftId: dutyIdShiftId[1],
          karkunType,
        });
      }
    );
  };

  refreshButton = () => {
    const { refreshData } = this.props;

    return (
      <Tooltip title="Reload Data">
        <Icon
          type="sync"
          onClick={event => {
            event.stopPropagation();
            if (refreshData) refreshData();
          }}
        />
      </Tooltip>
    );
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      showVolunteers,
      showEmployees,
      name,
      cnicNumber,
      phoneNumber,
      bloodGroup,
      jobId,
      dutyId,
      shiftId,
      allJobs,
      allDuties,
      allDutyShifts,
      allJobsLoading,
      allDutiesLoading,
      allDutyShiftsLoading,
    } = this.props;
    if (allJobsLoading || allDutiesLoading || allDutyShiftsLoading) return null;

    const dutyShiftCascaderData = getDutyShiftCascaderData(
      allDuties,
      allDutyShifts
    );

    const karkunTypes = [];
    if (!showVolunteers || showVolunteers === 'true')
      karkunTypes.push('volunteers');
    if (!showEmployees || showEmployees === 'true')
      karkunTypes.push('employees');

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1" extra={this.refreshButton()}>
          <Form layout="horizontal">
            <CheckboxField
              fieldName="karkunType"
              fieldLabel="Karkun Type"
              fieldLayout={formItemLayout}
              options={[
                { label: 'Volunteers', value: 'volunteers' },
                { label: 'Employees', value: 'employees' },
              ]}
              initialValue={karkunTypes}
              getFieldDecorator={getFieldDecorator}
            />
            <InputTextField
              fieldName="name"
              fieldLabel="Name"
              required={false}
              fieldLayout={formItemLayout}
              initialValue={name}
              getFieldDecorator={getFieldDecorator}
            />
            <InputCnicField
              fieldName="cnicNumber"
              fieldLabel="CNIC Number"
              required={false}
              requiredMessage="Please input a valid CNIC number."
              fieldLayout={formItemLayout}
              initialValue={cnicNumber}
              getFieldDecorator={getFieldDecorator}
            />
            <InputTextField
              fieldName="phoneNumber"
              fieldLabel="Phone Number"
              required={false}
              fieldLayout={formItemLayout}
              initialValue={phoneNumber}
              getFieldDecorator={getFieldDecorator}
            />
            <SelectField
              fieldName="bloodGroup"
              fieldLabel="Blood Group"
              required={false}
              data={[
                { label: 'A-', value: 'A-' },
                { label: 'A+', value: 'Aplus' },
                { label: 'B-', value: 'B-' },
                { label: 'B+', value: 'Bplus' },
                { label: 'AB-', value: 'AB-' },
                { label: 'AB+', value: 'ABplus' },
                { label: 'O-', value: 'O-' },
                { label: 'O+', value: 'Oplus' },
              ]}
              getDataValue={({ value }) => value}
              getDataText={({ label }) => label}
              fieldLayout={formItemLayout}
              initialValue={bloodGroup}
              getFieldDecorator={getFieldDecorator}
            />
            <SelectField
              fieldName="jobId"
              fieldLabel="Job"
              required={false}
              data={allJobs}
              getDataValue={({ _id }) => _id}
              getDataText={({ name: _name }) => _name}
              fieldLayout={formItemLayout}
              initialValue={jobId}
              getFieldDecorator={getFieldDecorator}
            />
            <CascaderField
              data={dutyShiftCascaderData}
              fieldName="dutyIdShiftId"
              fieldLabel="Duty/Shift"
              fieldLayout={formItemLayout}
              initialValue={[dutyId, shiftId]}
              required={false}
              getFieldDecorator={getFieldDecorator}
            />
            <Form.Item {...buttonItemLayout}>
              <Row type="flex" justify="end">
                <Button type="default" onClick={this.handleReset}>
                  Reset
                </Button>
                &nbsp;
                <Button type="primary" onClick={this.handleSubmit}>
                  Search
                </Button>
              </Row>
            </Form.Item>
          </Form>
        </Collapse.Panel>
      </Collapse>
    );
  }
}

const allJobsListQuery = gql`
  query allJobs {
    allJobs {
      _id
      name
    }
  }
`;

const allDutiesListQuery = gql`
  query allDuties {
    allDuties {
      _id
      name
    }
  }
`;

const allDutyShiftsListQuery = gql`
  query allDutyShifts {
    allDutyShifts {
      _id
      name
      dutyId
    }
  }
`;

export default flowRight(
  Form.create({ name: 'karkunsListFilter' }),
  graphql(allJobsListQuery, {
    props: ({ data }) => ({ allJobsLoading: data.loading, ...data }),
  }),
  graphql(allDutiesListQuery, {
    props: ({ data }) => ({ allDutiesLoading: data.loading, ...data }),
  }),
  graphql(allDutyShiftsListQuery, {
    props: ({ data }) => ({ allDutyShiftsLoading: data.loading, ...data }),
  })
)(ListFilter);
