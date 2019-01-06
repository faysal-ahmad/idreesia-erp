import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { WithBreadcrumbs } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import { InputTextField, FormButtonsSaveCancel } from '/imports/ui/modules/helpers/fields';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    itemCategoryById: PropTypes.object,
    updateItemCategory: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.itemCategoriesPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, itemCategoryById, updateItemCategory } = this.props;
    form.validateFields((err, { name }) => {
      if (err) return;

      updateItemCategory({
        variables: {
          id: itemCategoryById._id,
          name,
        },
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
    const { loading, itemCategoryById } = this.props;
    if (loading) return null;
    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="name"
          fieldLabel="Name"
          initialValue={itemCategoryById.name}
          required
          requiredMessage="Please input a name for the item category."
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
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
      name
    }
  }
`;

export default compose(
  Form.create(),
  graphql(formMutation, {
    name: 'updateItemCategory',
    options: {
      refetchQueries: ['allItemCategories'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { itemCategoryId } = match.params;
      return { variables: { id: itemCategoryId } };
    },
  }),
  WithBreadcrumbs(['Inventory', 'Setup', 'Item Categories', 'Edit'])
)(EditForm);
