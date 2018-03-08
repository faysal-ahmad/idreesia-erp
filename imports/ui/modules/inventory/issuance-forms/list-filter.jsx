import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Collapse, Form, Row, Button, Select, DatePicker } from 'antd';

const ContainerStyle = {
  width: '500px'
};

const FilterBoxStyle = {
  display: 'flex',
  flexFlow: 'column nowrap',
  justifyContent: 'space-between'
};

const StoreSelectStyle = {
  // width: '300px'
};

class ListFilter extends Component {
  static propTypes = {
    filterCriteria: PropTypes.object,
    physicalStores: PropTypes.array
  };

  getPhysicalStoreField() {
    const { physicalStores, filterCriteria } = this.props;
    const { getFieldDecorator } = this.props.form;
    const initialValue = filterCriteria.physicalStoreId;
    const rules = [];
    const options = [];
    physicalStores.forEach(physicalStore => {
      options.push(
        <Select.Option key={physicalStore._id} value={physicalStore._id}>
          {physicalStore.name}
        </Select.Option>
      );
    });

    return getFieldDecorator('physicalStoreId', { rules, initialValue })(
      <Select placeholder="Physical store" onChange={this.handleStoreChanged}>
        {options}
      </Select>
    );
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 12 }
    };

    const buttonItemLayout = {
      wrapperCol: { span: 12, offset: 4 }
    };

    const { physicalStores } = this.props;
    const selectedStoreId = null;
    // const { selectedStoreId } = this.state;
    const options = [];
    physicalStores.forEach(physicalStore => {
      options.push(
        <Select.Option key={physicalStore._id} value={physicalStore._id}>
          {physicalStore.name}
        </Select.Option>
      );
    });

    return (
      <Collapse style={ContainerStyle}>
        <Collapse.Panel header="Filter" key="1">
          <Form layout="horizontal" onSubmit={this.handleSubmit}>
            <Form.Item label="Physical Store" {...formItemLayout}>
              {this.getPhysicalStoreField()}
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
