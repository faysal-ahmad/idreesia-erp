import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { startCase } from 'meteor/idreesia-common/utilities/lodash';
import { Input, InputNumber, Select } from 'antd';

const ContainerStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
};

const DEFAULT_VALUE = JSON.stringify({ scale: 'days' });

const TextInput = Input as any;
const NumberInput = InputNumber as any;
const AntSelect = Select as any;
const SelectOption = (Select as any).Option;
interface Props { value?: string | null; disabled?: boolean; onChange?(value: string): void; }
interface DurationValue { scale?: string; duration?: number | null; }

export default class CustomInput extends Component<Props> {
  static propTypes = {
    value: PropTypes.string,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
  };

  scaleSelect: React.RefObject<any>;
  durationInput: React.RefObject<any>;

  constructor(props: Props) {
    super(props);
    this.scaleSelect = React.createRef();
    this.durationInput = React.createRef();
  }

  getScaleOptions = () => {
    const monthOptions = ['days', 'months', 'years'];
    return monthOptions.map((option: string) => (
      <SelectOption key={option} value={option}>
        {startCase(option)}
      </SelectOption>
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
    const { scale, duration } = JSON.parse(value || DEFAULT_VALUE) as DurationValue;

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
            placeholder="Less Than"
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
