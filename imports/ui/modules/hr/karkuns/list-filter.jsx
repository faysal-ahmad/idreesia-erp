import React, { Component } from "react";
import PropTypes from "prop-types";
import { Collapse, Form, Row, Button, Select } from "antd";

import { InputTextField } from "/imports/ui/modules/helpers/fields";

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

    refreshPage: PropTypes.func,
    queryParams: PropTypes.object,
    allDuties: PropTypes.array,
  };

  static defaultProps = {
    filterCriteria: {},
    allDuties: [],
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, refreshPage } = this.props;

    form.validateFields((err, { name, cnicNumber, dutyIds }) => {
      if (err) return;
      debugger;
      refreshPage({
        name,
        cnicNumber,
        dutyIds,
        pageIndex: 0,
      });
    });
  };

  getDutiesField() {
    const { allDuties, queryParams } = this.props;
    const { getFieldDecorator } = this.props.form;
    const initialValue = queryParams.dutyId;
    const rules = [];
    const options = [];
    allDuties.forEach(duty => {
      options.push(
        <Select.Option key={duty._id} value={duty._id}>
          {duty.name}
        </Select.Option>
      );
    });

    return getFieldDecorator("dutyIds", { rules, initialValue })(
      <Select mode="multiple" onChange={this.handleDutyChanged}>
        {options}
      </Select>
    );
  }

  handleDutyChanged = () => {};

  render() {
    const { getFieldDecorator } = this.props.form;
    const { queryParams } = this.props;

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1">
          <Form layout="horizontal" onSubmit={this.handleSubmit}>
            <InputTextField
              fieldName="name"
              fieldLabel="Name"
              required={false}
              fieldLayout={formItemLayout}
              initialValue={queryParams.name}
              getFieldDecorator={getFieldDecorator}
            />
            <InputTextField
              fieldName="cnicNumber"
              fieldLabel="CNIC Number"
              required={false}
              fieldLayout={formItemLayout}
              initialValue={queryParams.cnicNumber}
              getFieldDecorator={getFieldDecorator}
            />
            <Form.Item label="Duties" {...formItemLayout}>
              {this.getDutiesField()}
            </Form.Item>
            <Form.Item {...buttonItemLayout}>
              <Row type="flex" justify="end">
                <Button type="default" onClick={this.handleCancel}>
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

export default Form.create()(ListFilter);
