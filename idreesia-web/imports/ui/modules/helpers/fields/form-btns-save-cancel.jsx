import React from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { Button, Form, Row } from 'antd';

const buttonItemLayout = {
  wrapperCol: { span: 16, offset: 4 },
};

/**
 * handleCancel: Function to run when cancel button is pressed.
 */
const FormButtonsSaveCancel = ({ handleCancel, isFieldsTouched }) => (
  <Form.Item {...buttonItemLayout}>
    <Row type="flex" justify="end">
      <Button
        size="large"
        type="default"
        icon={<CloseCircleOutlined />}
        onClick={handleCancel}
      >
        Cancel
      </Button>
      &nbsp;
      <Button
        size="large"
        type="primary"
        icon={<SaveOutlined />}
        htmlType="submit"
        disabled={isFieldsTouched && !isFieldsTouched()}
      >
        Save
      </Button>
    </Row>
  </Form.Item>
);

FormButtonsSaveCancel.propTypes = {
  handleCancel: PropTypes.func,
  isFieldsTouched: PropTypes.func,
};

FormButtonsSaveCancel.defaultProps = {
  handleCancel: noop,
};

export default FormButtonsSaveCancel;
