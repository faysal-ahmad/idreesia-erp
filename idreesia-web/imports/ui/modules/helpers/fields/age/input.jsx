import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import { InputNumber } from 'antd';

export default class CustomInput extends Component {
  static propTypes = {
    value: PropTypes.object,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
  };

  handleChange = years => {
    const { onChange } = this.props;
    const newValue = dayjs().startOf('day');
    newValue.subtract(years, 'years');
    onChange(newValue);
  };

  render() {
    const { value } = this.props;
    const currentDate = dayjs().startOf('day');
    const diffInYears =
      value && value.isValid() ? currentDate.diff(value, 'years') : 0;

    return <InputNumber value={diffInYears} onChange={this.handleChange} />;
  }
}
