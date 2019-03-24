import React, { Component } from "react";
import PropTypes from "prop-types";
import { Collapse, Form, Row, Button, Select } from "antd";
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
    name: PropTypes.string,
    cnicNumber: PropTypes.string,
    dutyId: PropTypes.string,
    setPageParams: PropTypes.func,
  };

  static defaultProps = {
    filterCriteria: {},
    allDuties: [],
  };

  handleReset = () => {
    const { form, setPageParams } = this.props;
    form.resetFields();
    setPageParams({
      pageIndex: 0,
      name: null,
      cnicNumber: null,
      dutyId: null,
    });
  };

  handleSubmit = () => {
    const { form, setPageParams } = this.props;

    form.validateFields((err, { name, cnicNumber, dutyId }) => {
      if (err) return;
      setPageParams({
        pageIndex: 0,
        name,
        cnicNumber,
        dutyId,
      });
    });
  };

  getDutiesField() {
    const { allDuties, dutyId } = this.props;
    const { getFieldDecorator } = this.props.form;
    const rules = [];
    const options = [];
    allDuties.forEach(duty => {
      options.push(
        <Select.Option key={duty._id} value={duty._id}>
          {duty.name}
        </Select.Option>
      );
    });

    return getFieldDecorator("dutyIds", { rules, initialValue: dutyId })(
      <Select mode="multiple" onChange={this.handleDutyChanged}>
        {options}
      </Select>
    );
  }

  handleDutyChanged = () => {};

  render() {
    const { getFieldDecorator } = this.props.form;
    const { name, cnicNumber, dutyId, allDuties } = this.props;

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

export default compose(
  Form.create({ name: "karkunsListFilter" }),
  graphql(allDutiesListQuery, {
    props: ({ data }) => ({ ...data }),
  })
)(ListFilter);
