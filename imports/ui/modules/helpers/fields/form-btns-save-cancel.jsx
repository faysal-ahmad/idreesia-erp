import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Row } from 'antd';
import { noop } from 'lodash';

const buttonItemLayout = {
  wrapperCol: { span: 14, offset: 4 }
};

/**
 * handleCancel: Function to run when cancel button is pressed.
 */
export default class FormButtonsSaveCancel extends Component {
  static propTypes = {
    handleCancel: PropTypes.func
  };

  static defaultProps = {
    handleCancel: noop
  };

  render() {
    const { handleCancel } = this.props;
    return (
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
  }
}
