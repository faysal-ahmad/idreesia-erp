import React from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Form, Row } from 'antd';
import { noop } from 'lodash';

const buttonItemLayout = {
  wrapperCol: { span: 20, offset: 0 },
};

/**
 * handleCancel: Function to run when cancel button is pressed.
 */
const FormButtonsSaveCancelExtra = ({
  extraText,
  handleExtra,
  handleCancel,
}) => (
  <Form.Item {...buttonItemLayout}>
    <Row type="flex" justify="space-between">
      <Col>
        <Button size="large" type="default" onClick={handleExtra}>
          {extraText}
        </Button>
      </Col>
      <Col>
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
      </Col>
    </Row>
  </Form.Item>
);

FormButtonsSaveCancelExtra.propTypes = {
  extraText: PropTypes.string,
  handleExtra: PropTypes.func,
  handleCancel: PropTypes.func,
};

FormButtonsSaveCancelExtra.defaultProps = {
  handleExtra: noop,
  handleCancel: noop,
};

export default FormButtonsSaveCancelExtra;
