import React, { Component } from "react";
import PropTypes from "prop-types";
import { Collapse, Form, Row, Button } from "antd";

import { DateField, InputTextField } from "/imports/ui/modules/helpers/fields";

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
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    voucherNumber: PropTypes.string,
    setPageParams: PropTypes.func,
  };

  handleReset = () => {
    const { form, setPageParams } = this.props;
    form.resetFields();
    setPageParams({
      pageIndex: 0,
      startDate: null,
      endDate: null,
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, setPageParams } = this.props;

    form.validateFields((err, { startDate, endDate, voucherNumber }) => {
      if (err) return;
      setPageParams({
        pageIndex: 0,
        startDate,
        endDate,
        voucherNumber,
      });
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { startDate, endDate, voucherNumber } = this.props;

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1">
          <Form layout="horizontal" onSubmit={this.handleSubmit}>
            <DateField
              fieldName="startDate"
              fieldLabel="Start Date"
              fieldLayout={formItemLayout}
              required={false}
              initialValue={startDate}
              getFieldDecorator={getFieldDecorator}
            />
            <DateField
              fieldName="endDate"
              fieldLabel="End Date"
              fieldLayout={formItemLayout}
              required={false}
              initialValue={endDate}
              getFieldDecorator={getFieldDecorator}
            />
            <InputTextField
              fieldName="voucherNumber"
              fieldLabel="Voucher No."
              fieldLayout={formItemLayout}
              required={false}
              initialValue={voucherNumber}
              getFieldDecorator={getFieldDecorator}
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

export default Form.create({ name: "vouchersListFilter" })(ListFilter);
