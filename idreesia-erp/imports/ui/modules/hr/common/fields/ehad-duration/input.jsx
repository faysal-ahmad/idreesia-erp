import React, { Component } from "react";
import PropTypes from "prop-types";
import { Input, Select, Row, Col } from "antd";
import moment from "moment";

export default class CustomInput extends Component {
  static propTypes = {
    value: PropTypes.object,
    disabled: PropTypes.bool,
    onChange: PropTypes.func,
  };

  getYearOptions = () => {
    const yearOptions = [];
    for (let i = 0; i <= 40; i++) {
      yearOptions.push(
        <Select.Option key={i} value={i}>
          {i}
        </Select.Option>
      );
    }
    return yearOptions;
  };

  getMonthOptions = () => {
    const monthOptions = [];
    for (let i = 0; i <= 11; i++) {
      monthOptions.push(
        <Select.Option key={i} value={i}>
          {i}
        </Select.Option>
      );
    }
    return monthOptions;
  };

  handleYearChange = year => {
    const { value, onChange } = this.props;
    const currentDate = moment();
    const newValue = value.clone();
    newValue.year(currentDate.year() - year);
    onChange(newValue);
  };

  handleMonthChange = month => {
    const { value, onChange } = this.props;
    const currentDate = moment();
    const newValue = value.clone();
    newValue.month(currentDate.month() - month);
    onChange(newValue);
  };

  render() {
    const { value } = this.props;
    const currentDate = moment();
    const yearValue = currentDate.year() - value.year();
    const monthValue = currentDate.month() - value.month();

    return (
      <Input.Group>
        <Row type="flex" align="middle" gutter={10}>
          <Col span={5}>
            <Select
              style={{ width: "100%" }}
              onChange={this.handleYearChange}
              value={yearValue}
            >
              {this.getYearOptions()}
            </Select>
          </Col>
          <Col>years</Col>
          <Col span={5}>
            <Select
              style={{ width: "100%" }}
              onChange={this.handleMonthChange}
              value={monthValue}
            >
              {this.getMonthOptions()}
            </Select>
          </Col>
          <Col>months</Col>
        </Row>
      </Input.Group>
    );
  }
}
