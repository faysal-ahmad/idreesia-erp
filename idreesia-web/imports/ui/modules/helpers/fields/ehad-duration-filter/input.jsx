import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { startCase } from 'meteor/idreesia-common/utilities/lodash';
import { Input, InputNumber, Select } from '/imports/ui/controls';

const ContainerStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
};

const DEFAULT_VALUE = JSON.stringify({ scale: 'days' });

export default class CustomInput extends Component {
  static propTypes = {
    value: PropTypes.string,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.scaleSelect = React.createRef();
    this.durationInput = React.createRef();
  }

  getScaleOptions = () => {
    const monthOptions = ['days', 'months', 'years'];
    return monthOptions.map(option => (
      <Select.Option key={option} value={option}>
        {startCase(option)}
      </Select.Option>
    ));
  };

  handleScaleChange = scale => {
    const { onChange } = this.props;
    const duration = this.durationInput.current.props.value;
    const newValue = JSON.stringify({
      scale,
      duration,
    });
    onChange(newValue);
  };

  handleDurationChange = duration => {
    const { onChange } = this.props;
    const scale = this.scaleSelect.current.props.value;
    const newValue = JSON.stringify({
      scale,
      duration,
    });
    onChange(newValue);
  };

  render() {
    const { value } = this.props;
    const { scale, duration } = JSON.parse(value || DEFAULT_VALUE);

    const scaleSelect = (
      <Select
        ref={this.scaleSelect}
        style={{ width: '100px' }}
        onChange={this.handleScaleChange}
        value={scale}
      >
        {this.getScaleOptions()}
      </Select>
    );

    return (
      <Input.Group>
        <div style={ContainerStyle}>
          <Input
            style={{
              width: 100,
              border: 0,
              pointerEvents: 'none',
              backgroundColor: '#fff',
            }}
            placeholder="Less Than"
            disabled
          />
          <InputNumber
            ref={this.durationInput}
            allowClear
            value={duration}
            onChange={this.handleDurationChange}
          />
          {scaleSelect}
        </div>
      </Input.Group>
    );
  }
}
