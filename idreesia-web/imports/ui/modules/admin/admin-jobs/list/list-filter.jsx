import React, { Component } from "react";
import PropTypes from "prop-types";
import { Collapse, Form, Row, Button } from "antd";

import { JobTypes } from "meteor/idreesia-common/constants";
import { SelectField } from "/imports/ui/modules/helpers/fields";

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
    jobType: PropTypes.string,
    status: PropTypes.string,
    setPageParams: PropTypes.func,
  };

  formRef = React.createRef();

  handleReset = () => {
    const { setPageParams } = this.props;
    this.formRef.current.resetFields();
    setPageParams({
      pageIndex: 0,
      jobType: null,
      status: null,
    });
  };

  handleFinish = ({ jobType, status, voucherNumber }) => {
    const { setPageParams } = this.props;
    setPageParams({
      pageIndex: 0,
      jobType,
      status,
      voucherNumber,
    });
  };

  render() {
    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1">
          <Form ref={this.formRef} layout="horizontal" onFinish={this.handleFinish}>
            <SelectField
              data={[
                {
                  value: JobTypes.ACCOUNTS_IMPORT,
                  text: JobTypes.ACCOUNTS_IMPORT,
                },
                {
                  value: JobTypes.VOUCHERS_IMPORT,
                  text: JobTypes.VOUCHERS_IMPORT,
                },
                {
                  value: JobTypes.ACCOUNTS_CALCULATION,
                  text: JobTypes.ACCOUNTS_CALCULATION,
                },
              ]}
              getDataValue={({ value }) => value}
              getDataText={({ text }) => text}
              fieldName="jobType"
              fieldLabel="Job Type"
              fieldLayout={formItemLayout}
            />
            <SelectField
              data={[
                { value: "queued", text: "Queued" },
                { value: "processing", text: "Processing" },
                { value: "completed", text: "Completed" },
                { value: "errored", text: "Errored" },
              ]}
              getDataValue={({ value }) => value}
              getDataText={({ text }) => text}
              fieldName="status"
              fieldLabel="Status"
              fieldLayout={formItemLayout}
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
