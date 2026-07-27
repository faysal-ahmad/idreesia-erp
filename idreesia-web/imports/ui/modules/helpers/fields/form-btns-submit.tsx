import React from 'react';
import PropTypes from 'prop-types';

import { Button, Form, Row } from 'antd';

const AntButton = Button as any;
const AntFormItem = (Form as any).Item;
const AntRow = Row as any;
interface Props { text?: string; isFieldsTouched?: boolean; }

const buttonItemLayout = {
  wrapperCol: { span: 16, offset: 4 },
};

/**
 * text: Label for the button
 */
const FormButtonsSubmit = ({ text, isFieldsTouched }: Props) => (
  <AntFormItem {...buttonItemLayout}>
    <AntRow type="flex" justify="end">
      <AntButton
        size="large"
        type="primary"
        htmlType="submit"
        disabled={!isFieldsTouched}
      >
        {text}
      </AntButton>
    </AntRow>
  </AntFormItem>
);

FormButtonsSubmit.propTypes = {
  text: PropTypes.string,
  isFieldsTouched: PropTypes.bool,
};

FormButtonsSubmit.defaultProps = {
  text: 'Save',
};

export default FormButtonsSubmit;
