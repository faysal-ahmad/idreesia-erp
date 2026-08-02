import React from 'react';

import { Button, Form, Row } from 'antd';

interface Props {
  text?: string;
  isFieldsTouched?: boolean;
}

const buttonItemLayout = {
  wrapperCol: { span: 16, offset: 4 },
};

/**
 * text: Label for the button
 */
const FormButtonsSubmit = ({ text = 'Save', isFieldsTouched }: Props) => (
  <Form.Item {...buttonItemLayout}>
    <Row justify="end">
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

export default FormButtonsSubmit;
