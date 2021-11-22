import React from 'react';
import PropTypes from 'prop-types';

import { Button, Flex } from 'antd';

const RowStyle = { paddingLeft: '10px', paddingRight: '10px' };

const FormButtonsSaveCancel = ({
  saveText,
  cancelText,
  handleSave,
  handleCancel,
}) => (
  <Flex direction="row" justify="center" style={RowStyle}>
    <Flex.Item>
      <Button type="ghost" onClick={handleCancel}>
        {cancelText}
      </Button>
    </Flex.Item>
    <Flex.Item>
      <Button type="primary" onClick={handleSave}>
        {saveText}
      </Button>
    </Flex.Item>
  </Flex>
);

FormButtonsSaveCancel.propTypes = {
  saveText: PropTypes.string,
  cancelText: PropTypes.string,
  handleSave: PropTypes.func,
  handleCancel: PropTypes.func,
};

FormButtonsSaveCancel.defaultProps = {
  saveText: 'Save',
  cancelText: 'Cancel',
};

export default FormButtonsSaveCancel;
