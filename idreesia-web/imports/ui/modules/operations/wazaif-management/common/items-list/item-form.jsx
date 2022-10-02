import React from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Row } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';

import { InputNumberField } from '/imports/ui/modules/helpers/fields';
import { WazaifField } from '../wazaif-field';

const RowStyle = {
  height: '40px',
};
const ButtonContainerStyle = {
  paddingLeft: '20px',
};

const ItemForm = ({ handleAddItem }) => (
  <Row type="flex" justify="start" style={RowStyle}>
    <WazaifField
      fieldLayout={null}
      fieldName="wazeefa"
      placeholder="Wazeefa"
    />
    <InputNumberField
      fieldName="packets"
      placeholder="Packets"
      fieldLayout={null}
      minValue={0}
      precision={2}
    />
    <Form.Item style={ButtonContainerStyle}>
      <Button type="primary" icon={<PlusCircleOutlined />} onClick={handleAddItem}>
        Add Item
      </Button>
    </Form.Item>
  </Row>
);

ItemForm.propTypes = {
  wazaif: PropTypes.array,
  handleAddItem: PropTypes.func,
};

export default ItemForm;
