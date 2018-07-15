import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import {
  InputTextField,
  InputNumberField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

class EditForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    physicalStoreId: PropTypes.string,

    loading: PropTypes.bool,
    stockItemById: PropTypes.object,
    updateStockItem: PropTypes.func,
  };

  handleCancel = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.stockItemsPath(physicalStoreId));
  };

  handleSubmit = e => {
    e.preventDefault();
    const { physicalStoreId, stockItemById, updateStockItem, form, history } = this.props;
    form.validateFields((err, { minStockLevel, totalStockLevel }) => {
      if (err) return;
      updateStockItem({
        variables: {
          _id: stockItemById._id,
          minStockLevel,
          totalStockLevel,
        },
      })
        .then(() => {
          history.push(paths.stockItemsPath(physicalStoreId));
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  render() {
    const { loading, stockItemById } = this.props;
    const { getFieldDecorator } = this.props.form;
    if (loading) return null;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <InputTextField
          fieldName="physicalStoreId"
          fieldLabel="Physical Store"
          initialValue={stockItemById.physicalStoreName}
          disabled
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="itemCategoryId"
          fieldLabel="Item Category"
          initialValue={stockItemById.itemCategoryName}
          disabled
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="itemTypeId"
          fieldLabel="Item Type"
          initialValue={stockItemById.itemTypeName}
          disabled
          getFieldDecorator={getFieldDecorator}
        />
        <InputTextField
          fieldName="currentStockLevel"
          fieldLabel="Current Stock Level"
          initialValue={stockItemById.currentStockLevel}
          disabled
          getFieldDecorator={getFieldDecorator}
        />

        <InputNumberField
          fieldName="minStockLevel"
          fieldLabel="Min Stock Level"
          initialValue={stockItemById.minStockLevel}
          getFieldDecorator={getFieldDecorator}
        />
        <InputNumberField
          fieldName="totalStockLevel"
          fieldLabel="Total Stock Level"
          initialValue={stockItemById.totalStockLevel}
          getFieldDecorator={getFieldDecorator}
        />
        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation updateStockItem($_id: String!, $minStockLevel: Float, $totalStockLevel: Float) {
    updateStockItem(_id: $_id, minStockLevel: $minStockLevel, totalStockLevel: $totalStockLevel) {
      _id
      minStockLevel
      totalStockLevel
    }
  }
`;

const formQuery = gql`
  query stockItemById($_id: String!) {
    stockItemById(_id: $_id) {
      _id
      itemTypeName
      itemTypePicture
      itemCategoryName
      physicalStoreName
      unitOfMeasurement
      minStockLevel
      currentStockLevel
      totalStockLevel
    }
  }
`;

export default compose(
  Form.create(),
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ stockItemId }) => ({ variables: { _id: stockItemId } }),
  }),
  graphql(formMutation, {
    name: 'updateStockItem',
    options: {
      refetchQueries: ['pagedStockItems'],
    },
  })
)(EditForm);
