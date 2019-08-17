import React, { Component } from "react";
import PropTypes from "prop-types";
import { Collapse, Form, Row, Button } from "antd";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { filter, flowRight } from "lodash";

import {
  InputCnicField,
  InputTextField,
  CascaderField,
  SelectField,
} from "/imports/ui/modules/helpers/fields";

const ContainerStyle = {
  width: "500px",
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
    allDuties: PropTypes.array,
    allDutyShifts: PropTypes.array,
    name: PropTypes.string,
    cnicNumber: PropTypes.string,
    phoneNumber: PropTypes.string,
    bloodGroup: PropTypes.string,
    dutyId: PropTypes.string,
    shiftId: PropTypes.string,
    setPageParams: PropTypes.func,
  };

  static defaultProps = {
    cnicNumber: "",
    filterCriteria: {},
  };

  handleReset = () => {
    const { form, setPageParams } = this.props;
    form.resetFields();
    setPageParams({
      pageIndex: 0,
      name: null,
      cnicNumber: null,
      dutyId: null,
      shiftId: null,
    });
  };

  handleSubmit = () => {
    const { form, setPageParams } = this.props;

    form.validateFields(
      (err, { name, cnicNumber, phoneNumber, bloodGroup, dutyIdShiftId }) => {
        if (err) return;
        setPageParams({
          pageIndex: 0,
          name,
          cnicNumber,
          phoneNumber,
          bloodGroup,
          dutyId: dutyIdShiftId[0],
          shiftId: dutyIdShiftId[1],
        });
      }
    );
  };

  getDutyShiftCascaderData() {
    const { allDuties, allDutyShifts } = this.props;
    const data = allDuties.map(duty => {
      const dutyShifts = filter(
        allDutyShifts,
        dutyShift => dutyShift.dutyId === duty._id
      );
      const dataItem = {
        value: duty._id,
        label: duty.name,
        children: dutyShifts.map(dutyShift => ({
          value: dutyShift._id,
          label: dutyShift.name,
        })),
      };

      return dataItem;
    });

    return data;
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const {
      name,
      cnicNumber,
      phoneNumber,
      bloodGroup,
      dutyId,
      shiftId,
      allDuties,
      allDutyShifts,
    } = this.props;
    if (!allDuties || !allDutyShifts) return null;

    const dutyShiftCascaderData = this.getDutyShiftCascaderData();

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1">
          <Form layout="horizontal">
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
                { label: "A-", value: "A-" },
                { label: "A+", value: "A+" },
                { label: "B-", value: "B-" },
                { label: "B+", value: "B+" },
                { label: "AB-", value: "AB-" },
                { label: "AB+", value: "AB+" },
                { label: "O-", value: "O-" },
                { label: "O+", value: "O+" },
              ]}
              getDataValue={({ value }) => value}
              getDataText={({ label }) => label}
              fieldLayout={formItemLayout}
              initialValue={bloodGroup}
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
  Form.create({ name: "karkunsListFilter" }),
  graphql(allDutiesListQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(allDutyShiftsListQuery, {
    props: ({ data }) => ({ ...data }),
  })
)(ListFilter);
