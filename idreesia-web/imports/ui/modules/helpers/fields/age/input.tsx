import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';

import { InputNumber } from 'antd';

const NumberInput = InputNumber as any;
interface CustomInputProps { value?: any; disabled?: boolean; onChange?(value: any): void; }

export default class CustomInput extends Component<CustomInputProps> {
  static propTypes = {
    value: PropTypes.object,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
  };

  handleChange = (years: number | null) => {
    const { onChange } = this.props;
    let newValue = dayjs().startOf('day');
    newValue = newValue.subtract(years ?? 0, 'years');
    onChange?.(newValue);
  };

  render() {
    const { value } = this.props;
    const currentDate = dayjs().startOf('day');
    const diffInYears =
      value && value.isValid() ? currentDate.diff(value, 'years') : 0;

    return <NumberInput value={diffInYears} onChange={this.handleChange} />;
  }
}
