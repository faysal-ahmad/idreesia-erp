import React from 'react';

import { Button, Form, Row } from 'antd';

interface Props {
  text?: string;
  isFieldsTouched?: boolean;
  loading?: boolean;
}

const buttonItemLayout = {
  wrapperCol: { span: 16, offset: 4 },
};

/**
 * text: Label for the button
 */
const FormButtonsSubmit = ({
  text = 'Save',
  isFieldsTouched,
  loading = false,
}: Props) => (
  <Form.Item {...buttonItemLayout}>
    <Row justify="end">
      <Button
        size="large"
        type="primary"
        htmlType="submit"
        disabled={!isFieldsTouched || loading}
        loading={loading}
      >
        {text}
      </Button>
    </Row>
  </Form.Item>
);

export default FormButtonsSubmit;
