import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Form, Input, Button, Row } from 'antd';

import { composeWithTracker } from '/imports/ui/utils';
import { WithBreadcrumbs } from '/imports/ui/composers';
import { ItemCategories } from '/imports/lib/collections/inventory';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    itemCategory: PropTypes.object
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.itemCategoriesPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const { itemCategory } = this.props;
      const doc = Object.assign({}, itemCategory, {
        name: fieldsValue.name
      });

      Meteor.call('inventory/itemCategories.update', { doc }, (error, result) => {
        if (error) return;
        const { history } = this.props;
        history.push(paths.itemCategoriesPath);
      });
    });
  };

  getNameField() {
    const { itemCategory } = this.props;
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

function dataLoader(props, onData) {
  const { match } = props;
  const { itemCategoryId } = match.params;
  const subscription = Meteor.subscribe('inventory/itemCategories#byId', { id: itemCategoryId });
  if (subscription.ready()) {
    const itemCategory = ItemCategories.findOne(itemCategoryId);
    onData(null, { itemCategory });
  }
}

export default merge(
  Form.create(),
  composeWithTracker(dataLoader),
  WithBreadcrumbs(['Inventory', 'Setup', 'Item Categories', 'Edit'])
)(EditForm);
