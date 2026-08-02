import React, { Component } from 'react';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

import { InputNumber } from 'antd';

interface CustomInputProps {
  value?: Dayjs | null;
  disabled?: boolean;
  onChange?(value: Dayjs): void;
}

export default class CustomInput extends Component<CustomInputProps> {
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

    return <InputNumber value={diffInYears} onChange={this.handleChange} />;
  }
}
