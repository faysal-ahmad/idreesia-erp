import React from 'react';
import PropTypes from 'prop-types';

import { Button, Flex } from '/imports/ui/controls';

const RowStyle = { paddingLeft: '10px', paddingRight: '10px' };

const FormButtonsSaveCancel = ({ handleSave, handleCancel }) => (
  <Flex direction="row" justify="center" style={RowStyle}>
    <Flex.Item>
      <Button type="ghost" onClick={handleCancel}>
        Cancel
      </Button>
    </Flex.Item>
    <Flex.Item>
      <Button type="primary" onClick={handleSave}>
        Save
      </Button>
    </Flex.Item>
  </Flex>
);

FormButtonsSaveCancel.propTypes = {
  handleSave: PropTypes.func,
  handleCancel: PropTypes.func,
};
export default FormButtonsSaveCancel;
