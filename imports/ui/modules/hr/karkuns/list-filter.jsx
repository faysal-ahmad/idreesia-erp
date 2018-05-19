import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse, Form, Row, Button, Select, DatePicker } from 'antd';

import { InputTextField } from '/imports/ui/modules/helpers/fields';

const ContainerStyle = {
  width: '500px'
};

const FilterBoxStyle = {
  display: 'flex',
  flexFlow: 'column nowrap',
  justifyContent: 'space-between'
};

const formItemLayout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 12 }
};

const buttonItemLayout = {
  wrapperCol: { span: 12, offset: 4 }
};

class ListFilter extends Component {
  static propTypes = {
    filterCriteria: PropTypes.object,
    allDuties: PropTypes.array
  };

  static defaultProps = {
    filterCriteria: {},
    allDuties: []
  };

  getDutiesField() {
    const { allDuties, filterCriteria } = this.props;
    const { getFieldDecorator } = this.props.form;
    const initialValue = filterCriteria.dutyId;
    const rules = [];
    const options = [];
    allDuties.forEach(duty => {
      options.push(
        <Select.Option key={duty._id} value={duty._id}>
          {duty.name}
        </Select.Option>
      );
    });

    return getFieldDecorator('dutyId', { rules, initialValue })(
      <Select mode="multiple" onChange={this.handleDutyChanged}>
        {options}
      </Select>
    );
  }

  handleDutyChanged = () => {};

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1">
          <Form layout="horizontal" onSubmit={this.handleSubmit}>
            <InputTextField
              fieldName="name"
              fieldLabel="Name"
              required={false}
              fieldLayout={formItemLayout}
              getFieldDecorator={getFieldDecorator}
            />
            <InputTextField
              fieldName="cnicNumber"
              fieldLabel="CNIC Number"
              required={false}
              fieldLayout={formItemLayout}
              getFieldDecorator={getFieldDecorator}
            />
            <Form.Item label="Duties" {...formItemLayout}>
              {this.getDutiesField()}
            </Form.Item>
            <Form.Item {...buttonItemLayout}>
              <Row type="flex" justify="end">
                <Button type="secondary" onClick={this.handleCancel}>
                  Reset
                </Button>
                &nbsp;
                <Button type="primary">Search</Button>
              </Row>
            </Form.Item>
          </Form>
        </Collapse.Panel>
      </Collapse>
    );
  }
}

export default Form.create()(ListFilter);
