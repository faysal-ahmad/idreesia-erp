import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Form, Input, Button, Row } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    physicalStoreById: PropTypes.object,
    updatePhysicalStore: PropTypes.func
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.physicalStoresPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, physicalStoreById, updatePhysicalStore } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      updatePhysicalStore({
        variables: {
          id: physicalStoreById._id,
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

  getNameField(physicalStore) {
    const { getFieldDecorator } = this.props.form;
    const initialValue = physicalStore.name;
    const rules = [
      {
        required: true,
        message: 'Please input a name for the physical store.'
      }
    ];
    return getFieldDecorator('name', { initialValue, rules })(
      <Input placeholder="Physical store name" />
    );
  }

  getAddressField(physicalStore) {
    const { getFieldDecorator } = this.props.form;
    const initialValue = physicalStore.address;
    const rules = [];
    return getFieldDecorator('address', { initialValue, rules })(
      <Input.TextArea rows={5} placeholder="Physical store address" />
    );
  }

  render() {
    const { loading, physicalStoreById } = this.props;
    if (loading) return null;

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
          {this.getNameField(physicalStoreById)}
        </Form.Item>
        <Form.Item label="Address" {...formItemLayout}>
          {this.getAddressField(physicalStoreById)}
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

const formQuery = gql`
  query physicalStoreById($id: String!) {
    physicalStoreById(id: $id) {
      _id
      name
      address
    }
  }
`;

const formMutation = gql`
  mutation updatePhysicalStore($id: String!, $name: String!, $address: String!) {
    updatePhysicalStore(id: $id, name: $name, address: $address) {
      _id
      name
      address
    }
  }
`;

export default merge(
  Form.create(),
  graphql(formMutation, {
    name: 'updatePhysicalStore',
    options: {
      refetchQueries: ['allPhysicalStores']
    }
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { physicalStoreId } = match.params;
      return { variables: { id: physicalStoreId } };
    }
  }),
  WithBreadcrumbs(['Inventory', 'Setup', 'Physical Stores', 'Edit'])
)(EditForm);
