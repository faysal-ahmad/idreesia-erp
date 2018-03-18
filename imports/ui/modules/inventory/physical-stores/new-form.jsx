import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Form, Input, Button, Row } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    createPhysicalStore: PropTypes.func
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.physicalStoresPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createPhysicalStore, history } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      createPhysicalStore({
        variables: {
          name: fieldsValue.name,
          address: fieldsValue.address
        }
      })
        .then(() => {
          history.push(paths.physicalStoresPath);
        })
        .catch(error => {
          console.log(error);
        });
    });
  };

  getNameField() {
    const { getFieldDecorator } = this.props.form;
    const rules = [
      {
        required: true,
        message: 'Please input a name for the physical store.'
      }
    ];
    return getFieldDecorator('name', { rules })(<Input placeholder="Physical store name" />);
  }

  getAddressField() {
    const { getFieldDecorator } = this.props.form;
    const rules = [];
    return getFieldDecorator('address', { rules })(
      <Input.TextArea rows={5} placeholder="Physical store address" />
    );
  }

  render() {
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 14 }
    };

    const buttonItemLayout = {
      wrapperCol: { span: 14, offset: 4 }
    };

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <Form.Item label="Name" {...formItemLayout}>
          {this.getNameField()}
        </Form.Item>
        <Form.Item label="Address" {...formItemLayout}>
          {this.getAddressField()}
        </Form.Item>
        <Form.Item {...buttonItemLayout}>
          <Row type="flex" justify="end">
            <Button type="secondary" onClick={this.handleCancel}>
              Cancel
            </Button>
            &nbsp;
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Row>
        </Form.Item>
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createPhysicalStore($name: String!, $address: String!) {
    createPhysicalStore(name: $name, address: $address) {
      _id
      name
      address
    }
  }
`;

export default merge(
  Form.create(),
  graphql(formMutation, {
    name: 'createPhysicalStore',
    options: {
      refetchQueries: ['allPhysicalStores']
    }
  }),
  WithBreadcrumbs(['Inventory', 'Setup', 'Physical Stores', 'New'])
)(NewForm);
