import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Input, InputNumber, Select } from '/imports/ui/controls';

const ContainerStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  justifyContent: 'flex-start',
  alignItems: 'center',
};

const DEFAULT_VALUE = JSON.stringify({ criteria: 'less-than' });

export default class CustomInput extends Component {
  static propTypes = {
    value: PropTypes.string,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.criteriaSelect = React.createRef();
    this.percentageInput = React.createRef();
  }

  getCriteriaOptions = () => [
    <Select.Option key="less-than" value="less-than">
      Less Than
    </Select.Option>,
    <Select.Option key="more-than" value="more-than">
      More Than
    </Select.Option>,
  ];

  handleCriteriaChange = criteria => {
    const { onChange } = this.props;
    const percentage = this.percentageInput.current.props.value;
    const newValue = JSON.stringify({
      criteria,
      percentage,
    });
    onChange(newValue);
  };

  handlePercentageChange = percentage => {
    const { onChange } = this.props;
    const criteria = this.criteriaSelect.current.props.value;
    const newValue = JSON.stringify({
      criteria,
      percentage,
    });
    onChange(newValue);
  };

  render() {
    const { value } = this.props;
    const { criteria, percentage } = JSON.parse(value || DEFAULT_VALUE);

    return (
      <Input.Group>
        <div style={ContainerStyle}>
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
            allowClear
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
        </div>
      </Input.Group>
    );
  }
}
