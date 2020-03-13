import React from 'react';
import PropTypes from 'prop-types';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import { Button, Col, Form, Row } from '/imports/ui/controls';

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
  itemLayout,
  isFieldsTouched,
}) => (
  <Form.Item {...itemLayout}>
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
        <Button
          size="large"
          type="primary"
          icon="save"
          htmlType="submit"
          disabled={isFieldsTouched && !isFieldsTouched()}
        >
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
  itemLayout: PropTypes.object,
  isFieldsTouched: PropTypes.func,
};

FormButtonsSaveCancelExtra.defaultProps = {
  itemLayout: buttonItemLayout,
  handleExtra: noop,
  handleCancel: noop,
};

export default FormButtonsSaveCancelExtra;
