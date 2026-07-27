import React from "react";
import PropTypes from "prop-types";
import { noop } from "lodash";
import { CloseCircleOutlined } from '@ant-design/icons';

import { Button, Form, Row } from "antd";

const AntButton = Button as any;
const AntFormItem = (Form as any).Item;
const AntRow = Row as any;
const AntCloseCircleOutlined = typeof CloseCircleOutlined !== 'undefined' ? (CloseCircleOutlined as any) : undefined;
interface Props { handleClose?(): void; }

const buttonItemLayout = {
  wrapperCol: { span: 16, offset: 4 },
};

/**
 * handleClose: Function to run when close button is pressed.
 */
const FormButtonsClose = ({ handleClose }: Props) => (
  <AntFormItem {...buttonItemLayout}>
    <AntRow type="flex" justify="end">
      <AntButton
        size="large"
        type="default"
        icon={<AntCloseCircleOutlined />}
        onClick={handleClose}
      >
        Close
      </AntButton>
    </AntRow>
  </AntFormItem>
);

FormButtonsClose.propTypes = {
  handleClose: PropTypes.func,
};

FormButtonsClose.defaultProps = {
  handleClose: noop,
};

export default FormButtonsClose;
