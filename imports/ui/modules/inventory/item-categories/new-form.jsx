import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import { InputTextField, FormButtonsSaveCancel } from '/imports/ui/modules/helpers/fields';

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
    form.validateFields((err, { name }) => {
      if (err) return;

      createItemCategory({
        variables: { name }
      })
        .then(() => {
          history.push(paths.itemCategoriesPath);
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          required={true}
          requiredMessage="Please input a name for the item category."
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
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

export default compose(
  Form.create(),
  graphql(formMutation, {
    name: 'createItemCategory',
    options: {
      refetchQueries: ['allItemCategories']
    }
  }),
  WithBreadcrumbs(['Inventory', 'Setup', 'Item Categories', 'New'])
)(NewForm);
