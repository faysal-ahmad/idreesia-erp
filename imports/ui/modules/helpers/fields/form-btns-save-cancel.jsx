import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Row } from 'antd';
import { noop } from 'lodash';

const buttonItemLayout = {
  wrapperCol: { span: 14, offset: 4 },
};

/**
 * handleCancel: Function to run when cancel button is pressed.
 */
const FormButtonsSaveCancel = ({ handleCancel }) => (
  <Form.Item {...buttonItemLayout}>
    <Row type="flex" justify="end">
      <Button type="secondary" onClick={handleCancel}>
        Cancel
      </Button>
      &nbsp;
      <Button type="primary" htmlType="submit">
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
