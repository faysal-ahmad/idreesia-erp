import React, { Component } from "react";
import PropTypes from "prop-types";
import { Collapse, Form, Row, Button } from "antd";
import gql from "graphql-tag";
import { compose, graphql } from "react-apollo";

import {
  InputCnicField,
  InputTextField,
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
    dutyId: PropTypes.string,
    shiftId: PropTypes.string,
    setPageParams: PropTypes.func,
  };

  static defaultProps = {
    filterCriteria: {},
    allDuties: [],
    allDutyShifts: [],
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

    form.validateFields((err, { name, cnicNumber, dutyId, shiftId }) => {
      if (err) return;
      setPageParams({
        pageIndex: 0,
        name,
        cnicNumber,
        dutyId,
        shiftId,
      });
    });
  };

  handleDutyChanged = () => {};

  render() {
    const { getFieldDecorator } = this.props.form;
    const { name, cnicNumber, dutyId, allDuties, allDutyShifts } = this.props;

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
            <SelectField
              data={allDuties}
              getDataValue={({ _id }) => _id}
              getDataText={duty => duty.name}
              fieldName="dutyId"
              fieldLabel="Duty"
              fieldLayout={formItemLayout}
              required={false}
              initialValue={dutyId}
              getFieldDecorator={getFieldDecorator}
            />
            <SelectField
              data={allDutyShifts}
              getDataValue={({ _id }) => _id}
              getDataText={shift => shift.name}
              fieldName="shiftId"
              fieldLabel="Shift"
              fieldLayout={formItemLayout}
              required={false}
              initialValue={dutyId}
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
    }
  }
`;

export default compose(
  Form.create({ name: "karkunsListFilter" }),
  graphql(allDutiesListQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(allDutyShiftsListQuery, {
    props: ({ data }) => ({ ...data }),
  })
)(ListFilter);
