import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import {
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
} from '/imports/ui/modules/inventory/common/composers';
import { AuditInfo } from '/imports/ui/modules/common';

class EditForm extends Component {
  static propTypes = {
    match: PropTypes.object,
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    loading: PropTypes.bool,
    itemCategoryById: PropTypes.object,
    updateItemCategory: PropTypes.func,
  };
  
  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.itemCategoriesPath(physicalStoreId));
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({ name }) => {
    const {
      history,
      physicalStoreId,
      itemCategoryById,
      updateItemCategory,
    } = this.props;
    updateItemCategory({
      variables: {
        id: itemCategoryById._id,
        name,
      },
    })
      .then(() => {
        history.push(paths.itemCategoriesPath(physicalStoreId));
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { loading, itemCategoryById } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (loading) return null;

    return (
      <>
        <Form layout="horizontal" onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
          <InputTextField
            fieldName="name"
            fieldLabel="Name"
            initialValue={itemCategoryById.name}
            required
            requiredMessage="Please input a name for the item category."
          />
          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <AuditInfo record={itemCategoryById} />
      </>
    );
  }
}

const formQuery = gql`
  query itemCategoryById($id: String!) {
    itemCategoryById(id: $id) {
      _id
      name
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

const formMutation = gql`
  mutation updateItemCategory($id: String!, $name: String!) {
    updateItemCategory(id: $id, name: $name) {
      _id
      name
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  graphql(formMutation, {
    name: 'updateItemCategory',
    options: {
      refetchQueries: ['itemCategoriesByPhysicalStoreId'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { itemCategoryId } = match.params;
      return { variables: { id: itemCategoryId } };
    },
  }),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Setup, Item Categories, Edit`;
    }
    return `Inventory, Setup, Item Categories, Edit`;
  })
)(EditForm);
