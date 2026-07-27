import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Input, InputNumber, Select } from 'antd';

const ContainerStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
};

const DEFAULT_VALUE = JSON.stringify({ criteria: 'less-than' });

const TextInput = Input as any;
const NumberInput = InputNumber as any;
const AntSelect = Select as any;
interface FilterValue { criteria?: string; percentage?: number | null; }
interface CustomInputProps { value?: string; disabled?: boolean; onChange?(value: string): void; }

export default class CustomInput extends Component<CustomInputProps> {
  criteriaSelect: React.RefObject<any>;
  percentageInput: React.RefObject<any>;
  static propTypes = {
    value: PropTypes.string,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
  };

  constructor(props: CustomInputProps) {
    super(props);
    this.criteriaSelect = React.createRef<any>();
    this.percentageInput = React.createRef<any>();
  }

  getCriteriaOptions = () => [
    <AntSelect.Option key="less-than" value="less-than">
      Less Than
    </AntSelect.Option>,
    <AntSelect.Option key="more-than" value="more-than">
      More Than
    </AntSelect.Option>,
  ];

  handleCriteriaChange = (criteria: string) => {
    const { onChange } = this.props;
    const percentage = this.percentageInput.current.props.value;
    const newValue = JSON.stringify({
      criteria,
      percentage,
    });
    onChange?.(newValue);
  };

  handlePercentageChange = (percentage: number | null) => {
    const { onChange } = this.props;
    const criteria = this.criteriaSelect.current.props.value;
    const newValue = JSON.stringify({
      criteria,
      percentage,
    });
    onChange?.(newValue);
  };

  render() {
    const { value } = this.props;
    const { criteria, percentage } = JSON.parse(value || DEFAULT_VALUE) as FilterValue;

    return (
      <TextInput.Group>
        <div style={ContainerStyle as any}>
          <AntSelect
            ref={this.criteriaSelect}
            style={{ width: '100px' }}
            onChange={this.handleCriteriaChange}
            value={criteria}
          >
            {this.getCriteriaOptions()}
          </AntSelect>
          <NumberInput
            ref={this.percentageInput}
            value={percentage}
            onChange={this.handlePercentageChange}
          />
          <TextInput
            style={{
              width: 100,
              border: 0,
              pointerEvents: 'none',
              backgroundColor: '#fff',
            }}
            placeholder="percent"
            disabled
          />
        </div>
      </TextInput.Group>
    );
  }
}
