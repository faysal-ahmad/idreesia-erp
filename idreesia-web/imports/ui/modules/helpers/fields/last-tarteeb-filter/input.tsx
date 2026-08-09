import React, { Component } from 'react';
import { Input, InputNumber, Select, Space } from 'antd';

import { startCase } from 'meteor/idreesia-common/utilities/lodash';

const DEFAULT_VALUE = JSON.stringify({ scale: 'months' });

interface FilterValue {
  scale?: string;
  duration?: number | null;
}

interface CustomInputProps {
  value?: string;
  disabled?: boolean;
  onChange?(value: string): void;
}

interface RefWithValue {
  props: {
    value: string | number | null;
  };
}

export default class CustomInput extends Component<CustomInputProps> {
  scaleSelect = React.createRef<React.ComponentRef<typeof Select>>();
  durationInput = React.createRef<React.ComponentRef<typeof InputNumber>>();

  getScaleOptions = () => {
    const monthOptions = ['days', 'months', 'years'];
    return monthOptions.map((option: string) => (
      <Select.Option key={option} value={option}>
        {startCase(option)}
      </Select.Option>
    ));
  };

  handleScaleChange = (scale: string) => {
    const { onChange } = this.props;
    const duration = (this.durationInput.current as RefWithValue | null)?.props.value;
    const newValue = JSON.stringify({
      scale,
      duration,
    });
    onChange?.(newValue);
  };

  handleDurationChange = (duration: number | null) => {
    const { onChange } = this.props;
    const scale = (this.scaleSelect.current as RefWithValue | null)?.props.value;
    const newValue = JSON.stringify({
      scale,
      duration,
    });
    onChange?.(newValue);
  };

  render() {
    const { value } = this.props;
    const { scale, duration } = JSON.parse(value || DEFAULT_VALUE) as FilterValue;

    return (
      <Space.Compact>
        <Input
          style={{
            width: 100,
            border: 0,
            pointerEvents: 'none',
            backgroundColor: '#fff',
          }}
          placeholder="More Than"
          disabled
        />
        <InputNumber
          ref={this.durationInput}
          value={duration}
          onChange={this.handleDurationChange}
        />
        <Select
          ref={this.scaleSelect}
          style={{ width: '100px' }}
          onChange={this.handleScaleChange}
          value={scale}
        >
          {this.getScaleOptions()}
        </Select>
      </Space.Compact>
    );
  }
}
