import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Collapse, Form, Row } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  CheckboxGroupField,
  InputCnicField,
  InputTextField,
  CascaderField,
  SelectField,
  LastTarteebFilterField,
} from '/imports/ui/modules/helpers/fields';
import { RefreshButton } from '/imports/ui/modules/helpers/controls';
import { getDutyShiftCascaderData } from '/imports/ui/modules/hr/common/utilities';
import {
  WithAllJobs,
  WithAllMSDuties,
  WithAllDutyShifts,
} from '/imports/ui/modules/hr/common/composers';

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
    allJobs: PropTypes.array,
    allMSDuties: PropTypes.array,
    allDutyShifts: PropTypes.array,
    allJobsLoading: PropTypes.bool,
    allMSDutiesLoading: PropTypes.bool,
    allDutyShiftsLoading: PropTypes.bool,
    name: PropTypes.string,
    cnicNumber: PropTypes.string,
    phoneNumber: PropTypes.string,
    bloodGroup: PropTypes.string,
    lastTarteeb: PropTypes.string,
    jobId: PropTypes.string,
    dutyId: PropTypes.string,
    dutyShiftId: PropTypes.string,
    showVolunteers: PropTypes.string,
    showEmployees: PropTypes.string,
    setPageParams: PropTypes.func,
    refreshData: PropTypes.func,
  };

  static defaultProps = {
    cnicNumber: '',
  };

  formRef = React.createRef();

  handleReset = () => {
    const { setPageParams } = this.props;
    this.formRef.current.resetFields();
    setPageParams({
      pageIndex: 0,
      name: null,
      cnicNumber: null,
      phoneNumber: null,
      bloodGroup: null,
      lastTarteeb: null,
      jobId: null,
      dutyId: null,
      dutyShiftId: null,
      karkunType: ['volunteers', 'employees'],
    });
  };

  handleFinish = ({
    name,
    cnicNumber,
    phoneNumber,
    bloodGroup,
    lastTarteeb,
    jobId,
    dutyIdShiftId,
    karkunType,
  }) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: 0,
      name,
      cnicNumber,
      phoneNumber,
      bloodGroup,
      lastTarteeb,
      jobId,
      dutyId: dutyIdShiftId[0],
      dutyShiftId: dutyIdShiftId[1],
      karkunType,
    });
  };

  refreshButton = () => <RefreshButton refreshData={this.props.refreshData} />;

  render() {
    const {
      showVolunteers,
      showEmployees,
      name,
      cnicNumber,
      phoneNumber,
      bloodGroup,
      lastTarteeb,
      jobId,
      dutyId,
      dutyShiftId,
      allJobs,
      allMSDuties,
      allDutyShifts,
      allJobsLoading,
      allMSDutiesLoading,
      allDutyShiftsLoading,
    } = this.props;
    if (allJobsLoading || allMSDutiesLoading || allDutyShiftsLoading)
      return null;

    const dutyShiftCascaderData = getDutyShiftCascaderData(
      allMSDuties,
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
          <Form ref={this.formRef} layout="horizontal" onFinish={this.handleFinish}>
            <CheckboxGroupField
              fieldName="karkunType"
              fieldLabel="Karkun Type"
              fieldLayout={formItemLayout}
              options={[
                { label: 'Volunteers', value: 'volunteers' },
                { label: 'Employees', value: 'employees' },
              ]}
              initialValue={karkunTypes}
            />
            <InputTextField
              fieldName="name"
              fieldLabel="Name"
              required={false}
              fieldLayout={formItemLayout}
              initialValue={name}
            />
            <InputCnicField
              fieldName="cnicNumber"
              fieldLabel="CNIC Number"
              required={false}
              requiredMessage="Please input a valid CNIC number."
              fieldLayout={formItemLayout}
              initialValue={cnicNumber}
            />
            <InputTextField
              fieldName="phoneNumber"
              fieldLabel="Phone Number"
              required={false}
              fieldLayout={formItemLayout}
              initialValue={phoneNumber}
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
            />
            <LastTarteebFilterField
              fieldName="lastTarteeb"
              fieldLabel="Last Tarteeb"
              required={false}
              fieldLayout={formItemLayout}
              initialValue={lastTarteeb}
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
            />
            <CascaderField
              data={dutyShiftCascaderData}
              fieldName="dutyIdShiftId"
              fieldLabel="Duty/Shift"
              fieldLayout={formItemLayout}
              initialValue={[dutyId, dutyShiftId]}
              required={false}
            />
            <Form.Item {...buttonItemLayout}>
              <Row type="flex" justify="end">
                <Button type="default" onClick={this.handleReset}>
                  Reset
                </Button>
                &nbsp;
                <Button type="primary" htmlType="submit">
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

export default flowRight(
  WithAllJobs(),
  WithAllMSDuties(),
  WithAllDutyShifts()
)(ListFilter);
