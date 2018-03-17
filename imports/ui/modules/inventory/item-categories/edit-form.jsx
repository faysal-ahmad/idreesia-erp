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

    itemCategoryById: PropTypes.object,
    updateItemCategory: PropTypes.func
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.itemCategoriesPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, itemCategoryById, updateItemCategory } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      debugger;
      updateItemCategory({
        variables: {
          id: itemCategoryById._id,
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

  getNameField(itemCategory) {
    const { getFieldDecorator } = this.props.form;
    const initialValue = itemCategory.name;
    const rules = [
      {
        required: true,
        message: 'Please input a name for the item category.'
      }
    ];
    return getFieldDecorator('name', { initialValue, rules })(
      <Input placeholder="Item category name" />
    );
  }

  render() {
    const { loading, itemCategoryById } = this.props;
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
          {this.getNameField(itemCategoryById)}
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
  query itemCategoryById($id: String!) {
    itemCategoryById(id: $id) {
      _id
      name
    }
  }
`;

const formMutation = gql`
  mutation updateItemCategory($id: String!, $name: String!) {
    updateItemCategory(id: $id, name: $name) {
      _id
    }
  }
`;

export default merge(
  Form.create(),
  graphql(formMutation, {
    name: 'updateItemCategory'
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { itemCategoryId } = match.params;
      return { variables: { id: itemCategoryId } };
    }
  }),
  WithBreadcrumbs(['Inventory', 'Setup', 'Item Categories', 'Edit'])
)(EditForm);
