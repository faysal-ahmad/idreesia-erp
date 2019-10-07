import React from 'react';
import PropTypes from 'prop-types';

import { List, Picker } from '/imports/ui/controls';

function getDurationDataOptions() {
  const yearOptions = [];
  for (let i = 0; i <= 40; i++) {
    yearOptions.push({
      label: i === 1 ? `${i} Year` : `${i} Years`,
      value: i,
    });
  }

  const monthOptions = [];
  for (let i = 0; i <= 11; i++) {
    monthOptions.push({
      label: i === 1 ? `${i} Month` : `${i} Months`,
      value: i,
    });
  }

  return [yearOptions, monthOptions];
}

const EhadDurationField = ({ fieldName, initialValue, getFieldDecorator }) =>
  getFieldDecorator(fieldName, { initialValue })(
    <Picker
      data={getDurationDataOptions()}
      cascade={false}
      okText="OK"
      dismissText="Cancel"
    >
      <List.Item arrow="horizontal">Ehad Duration</List.Item>
    </Picker>
  );

EhadDurationField.propTypes = {
  fieldName: PropTypes.string,
  initialValue: PropTypes.any,
  getFieldDecorator: PropTypes.func,
};

EhadDurationField.defaultProps = {
  initialValue: [0, 0],
};

export default EhadDurationField;
