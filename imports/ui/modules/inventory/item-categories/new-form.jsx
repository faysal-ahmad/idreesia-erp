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
    createItemCategory: PropTypes.func
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.itemCategoriesPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, createItemCategory, history } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      createItemCategory({
        variables: {
          name: fieldsValue.name
        }
      })
        .then(() => {
          history.push(paths.itemCategoriesPath);
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
        message: 'Please input a name for the item category.'
      }
    ];
    return getFieldDecorator('name', { rules })(<Input placeholder="Item category name" />);
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
  mutation createItemCategory($name: String!) {
    createItemCategory(name: $name) {
      _id
      name
    }
  }
`;

export default merge(
  Form.create(),
  graphql(formMutation, {
    name: 'createItemCategory',
    options: {
      refetchQueries: ['allItemCategories']
    }
  }),
  WithBreadcrumbs(['Inventory', 'Setup', 'Item Categories', 'New'])
)(NewForm);
