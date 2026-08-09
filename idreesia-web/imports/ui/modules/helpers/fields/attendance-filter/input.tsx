import React, { Component } from 'react';

import { Input, InputNumber, Select, Space } from 'antd';

const DEFAULT_VALUE = JSON.stringify({ criteria: 'less-than' });

interface FilterValue {
  criteria?: string;
  percentage?: number | null;
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
  criteriaSelect = React.createRef<React.ComponentRef<typeof Select>>();
  percentageInput = React.createRef<React.ComponentRef<typeof InputNumber>>();

  getCriteriaOptions = () => [
    <Select.Option key="less-than" value="less-than">
      Less Than
    </Select.Option>,
    <Select.Option key="more-than" value="more-than">
      More Than
    </Select.Option>,
  ];

  handleCriteriaChange = (criteria: string) => {
    const { onChange } = this.props;
    const percentage = (this.percentageInput.current as RefWithValue | null)?.props.value;
    const newValue = JSON.stringify({
      criteria,
      percentage,
    });
    onChange?.(newValue);
  };

  handlePercentageChange = (percentage: number | null) => {
    const { onChange } = this.props;
    const criteria = (this.criteriaSelect.current as RefWithValue | null)?.props.value;
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
      <Space.Compact>
        <Select
          ref={this.criteriaSelect}
          style={{ width: '100px' }}
          onChange={this.handleCriteriaChange}
          value={criteria}
        >
          {this.getCriteriaOptions()}
        </Select>
        <InputNumber
          ref={this.percentageInput}
          value={percentage}
          onChange={this.handlePercentageChange}
        />
        <Input
          style={{
            width: 100,
            border: 0,
            pointerEvents: 'none',
            backgroundColor: '#fff',
          }}
          placeholder="percent"
          disabled
        />
      </Space.Compact>
    );
  }
}
