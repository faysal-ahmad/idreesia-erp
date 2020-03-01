import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { InputNumber } from '/imports/ui/controls';

export default class CustomInput extends Component {
  static propTypes = {
    value: PropTypes.object,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
  };

  handleChange = years => {
    const { onChange } = this.props;
    const newValue = moment().startOf('day');
    newValue.subtract(years, 'years');
    onChange(newValue);
  };

  render() {
    const { value } = this.props;
    const currentDate = moment().startOf('day');
    const diffInYears =
      value && value.isValid() ? currentDate.diff(value, 'years') : 0;

    return <InputNumber value={diffInYears} onChange={this.handleChange} />;
  }
}
