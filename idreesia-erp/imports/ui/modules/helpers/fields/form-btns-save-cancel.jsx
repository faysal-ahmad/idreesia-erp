import React from "react";
import PropTypes from "prop-types";
import { Button, Form, Row } from "antd";
import { noop } from "lodash";

const buttonItemLayout = {
  wrapperCol: { span: 16, offset: 4 },
};

/**
 * handleCancel: Function to run when cancel button is pressed.
 */
const FormButtonsSaveCancel = ({ handleCancel }) => (
  <Form.Item {...buttonItemLayout}>
    <Row type="flex" justify="end">
      <Button
        size="large"
        type="default"
        icon="close-circle"
        onClick={handleCancel}
      >
        Cancel
      </Button>
      &nbsp;
      <Button size="large" type="primary" icon="save" htmlType="submit">
        Save
      </Button>
    </Row>
  </Form.Item>
);

FormButtonsSaveCancel.propTypes = {
  handleCancel: PropTypes.func,
};

FormButtonsSaveCancel.defaultProps = {
  handleCancel: noop,
};

export default FormButtonsSaveCancel;
