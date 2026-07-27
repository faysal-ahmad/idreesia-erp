import React from 'react';
import PropTypes from 'prop-types';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { noop } from 'meteor/idreesia-common/utilities/lodash';
import { Button, Col, Form, Row } from 'antd';

const AntButton = Button as any;
const AntCol = Col as any;
const AntFormItem = (Form as any).Item;
const AntRow = Row as any;
const AntCloseCircleOutlined = CloseCircleOutlined as any;
const AntSaveOutlined = SaveOutlined as any;
interface Props { allowSubmit?: boolean; extraText?: string; handleExtra?(): void; handleCancel?(): void; itemLayout?: Record<string, unknown>; isFieldsTouched?: boolean; }

const buttonItemLayout = {
  wrapperCol: { span: 20, offset: 0 },
};

/**
 * handleCancel: Function to run when cancel button is pressed.
 */
const FormButtonsSaveCancelExtra = ({
  allowSubmit,
  extraText,
  handleExtra,
  handleCancel,
  itemLayout,
  isFieldsTouched,
}: Props) => (
  <AntFormItem {...itemLayout}>
    <AntRow type="flex" justify="space-between">
      <AntCol>
        <AntButton size="large" type="default" onClick={handleExtra}>
          {extraText}
        </AntButton>
      </AntCol>
      <AntCol>
        <AntButton
          size="large"
          type="default"
          icon={<AntCloseCircleOutlined />}
          onClick={handleCancel}
        >
          Cancel
        </AntButton>
        &nbsp;
        <AntButton
          size="large"
          type="primary"
          icon={<AntSaveOutlined />}
          htmlType="submit"
          disabled={!allowSubmit || !isFieldsTouched}
        >
          Save
        </AntButton>
      </AntCol>
    </AntRow>
  </AntFormItem>
);

FormButtonsSaveCancelExtra.propTypes = {
  allowSubmit: PropTypes.bool,
  extraText: PropTypes.string,
  handleExtra: PropTypes.func,
  handleCancel: PropTypes.func,
  itemLayout: PropTypes.object,
  isFieldsTouched: PropTypes.bool,
};

FormButtonsSaveCancelExtra.defaultProps = {
  allowSubmit: true,
  itemLayout: buttonItemLayout,
  handleExtra: noop,
  handleCancel: noop,
};

export default FormButtonsSaveCancelExtra;
