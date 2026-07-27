import React from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash';
import { CloseCircleOutlined, SaveOutlined } from '@ant-design/icons';

import { Button, Form, Row } from 'antd';

const AntButton = Button as any;
const AntFormItem = (Form as any).Item;
const AntRow = Row as any;
const AntCloseCircleOutlined = typeof CloseCircleOutlined !== 'undefined' ? (CloseCircleOutlined as any) : undefined;
const AntSaveOutlined = typeof SaveOutlined !== 'undefined' ? (SaveOutlined as any) : undefined;
interface Props { handleCancel?(): void; isFieldsTouched?: boolean; }

const buttonItemLayout = {
  wrapperCol: { span: 16, offset: 4 },
};

/**
 * handleCancel: Function to run when cancel button is pressed.
 */
const FormButtonsSaveCancel = ({ handleCancel, isFieldsTouched }: Props) => (
  <AntFormItem {...buttonItemLayout}>
    <AntRow type="flex" justify="end">
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
        disabled={!isFieldsTouched}
      >
        Save
      </AntButton>
    </AntRow>
  </AntFormItem>
);

FormButtonsSaveCancel.propTypes = {
  handleCancel: PropTypes.func,
  isFieldsTouched: PropTypes.bool,
};

FormButtonsSaveCancel.defaultProps = {
  handleCancel: noop,
};

export default FormButtonsSaveCancel;
