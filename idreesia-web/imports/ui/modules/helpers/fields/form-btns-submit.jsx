import React from 'react';
import PropTypes from 'prop-types';

import { Button, Form, Row } from 'antd';

const buttonItemLayout = {
  wrapperCol: { span: 16, offset: 4 },
};

/**
 * text: Label for the button
 */
const FormButtonsSubmit = ({ text, isFieldsTouched }) => (
  <Form.Item {...buttonItemLayout}>
    <Row type="flex" justify="end">
      <Button
        size="large"
        type="primary"
        htmlType="submit"
        disabled={!isFieldsTouched}
      >
        {text}
      </Button>
    </Row>
  </Form.Item>
);

FormButtonsSubmit.propTypes = {
  text: PropTypes.string,
  isFieldsTouched: PropTypes.bool,
};

FormButtonsSubmit.defaultProps = {
  text: 'Save',
};

export default FormButtonsSubmit;
