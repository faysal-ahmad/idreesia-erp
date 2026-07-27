import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Input, InputNumber, Select } from 'antd';

import { startCase } from 'meteor/idreesia-common/utilities/lodash';

const ContainerStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
};

const DEFAULT_VALUE = JSON.stringify({ scale: 'months' });

const TextInput = Input as any;
const NumberInput = InputNumber as any;
const AntSelect = Select as any;
interface FilterValue { scale?: string; duration?: number | null; }
interface CustomInputProps { value?: string; disabled?: boolean; onChange?(value: string): void; }

export default class CustomInput extends Component<CustomInputProps> {
  scaleSelect: React.RefObject<any>;
  durationInput: React.RefObject<any>;
  static propTypes = {
    value: PropTypes.string,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
  };

  constructor(props: CustomInputProps) {
    super(props);
    this.scaleSelect = React.createRef<any>();
    this.durationInput = React.createRef<any>();
  }

  getScaleOptions = () => {
    const monthOptions = ['days', 'months', 'years'];
    return monthOptions.map((option: string) => (
      <AntSelect.Option key={option} value={option}>
        {startCase(option)}
      </AntSelect.Option>
    ));
  };

  handleScaleChange = (scale: string) => {
    const { onChange } = this.props;
    const duration = this.durationInput.current.props.value;
    const newValue = JSON.stringify({
      scale,
      duration,
    });
    onChange?.(newValue);
  };

  handleDurationChange = (duration: number | null) => {
    const { onChange } = this.props;
    const scale = this.scaleSelect.current.props.value;
    const newValue = JSON.stringify({
      scale,
      duration,
    });
    onChange?.(newValue);
  };

  render() {
    const { value } = this.props;
    const { scale, duration } = JSON.parse(value || DEFAULT_VALUE) as FilterValue;

    const scaleSelect = (
      <AntSelect
        ref={this.scaleSelect}
        style={{ width: '100px' }}
        onChange={this.handleScaleChange}
        value={scale}
      >
        {this.getScaleOptions()}
      </AntSelect>
    );

    return (
      <TextInput.Group>
        <div style={ContainerStyle as any}>
          <TextInput
            style={{
              width: 100,
              border: 0,
              pointerEvents: 'none',
              backgroundColor: '#fff',
            }}
            placeholder="More Than"
            disabled
          />
          <NumberInput
            ref={this.durationInput}
            value={duration}
            onChange={this.handleDurationChange}
          />
          {scaleSelect}
        </div>
      </TextInput.Group>
    );
  }
}
