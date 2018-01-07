import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Form, Input, Button, Row } from 'antd';

import { ItemCategories } from '/imports/lib/collections/inventory';
import { InventorySubModulePaths as paths } from '/imports/ui/constants';
import { GlobalActionsCreator } from '/imports/ui/action-creators';

class NewForm extends React.Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    setBreadcrumbs: PropTypes.func
  };

  componentWillMount() {
    const { setBreadcrumbs } = this.props;
    setBreadcrumbs(['Inventory', 'Setup', 'Item Categories', 'New']);
  }

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.physicalStoresPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const doc = {
        name: fieldsValue.name
      };

      Meteor.call('inventory/itemCategories.create', { doc }, (error, result) => {
        if (error) return;
        const { history } = this.props;
        history.push(paths.itemCategoriesPath);
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
    const props = this.props;
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

const mapDispatchToProps = dispatch => {
  return {
    setBreadcrumbs: breadcrumbs => {
      dispatch(GlobalActionsCreator.setBreadcrumbs(breadcrumbs));
    }
  };
};

export default merge(Form.create(), connect(null, mapDispatchToProps))(NewForm);
