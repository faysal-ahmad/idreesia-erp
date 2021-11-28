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
    startDate: PropTypes.object,
    endDate: PropTypes.object,
    voucherNumber: PropTypes.string,
    setPageParams: PropTypes.func,
  };

  formRef = React.createRef();

  handleReset = () => {
    const { setPageParams } = this.props;
    this.formRef.current.resetFields();
    setPageParams({
      pageIndex: 0,
      startDate: null,
      endDate: null,
    });
  };

  handleFinish = ({ startDate, endDate, voucherNumber }) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: 0,
      startDate,
      endDate,
      voucherNumber,
    });
  };

  render() {
    const { startDate, endDate, voucherNumber } = this.props;

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1">
          <Form ref={this.formRef} layout="horizontal" onFinish={this.handleFinish}>
            <DateField
              fieldName="startDate"
              fieldLabel="Start Date"
              fieldLayout={formItemLayout}
              required={false}
              initialValue={startDate}
            />
            <DateField
              fieldName="endDate"
              fieldLabel="End Date"
              fieldLayout={formItemLayout}
              required={false}
              initialValue={endDate}
            />
            <InputTextField
              fieldName="voucherNumber"
              fieldLabel="Voucher No."
              fieldLayout={formItemLayout}
              required={false}
              initialValue={voucherNumber}
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

export default ListFilter;
