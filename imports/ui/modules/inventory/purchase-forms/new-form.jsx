import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { ItemsList } from '../common/items-list';
import { WithBreadcrumbs } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import { WithPhysicalStoreId } from '/imports/ui/modules/inventory/common/composers';
import {
  AutoCompleteField,
  DateField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

const formItemExtendedLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    physicalStoreId: PropTypes.string,

    loading: PropTypes.bool,
    allKarkuns: PropTypes.array,
    stockItemsByPhysicalStoreId: PropTypes.array,
    createPurchaseForm: PropTypes.func,
  };

  handleCancel = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.purchaseFormsPath(physicalStoreId));
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, physicalStoreId, createPurchaseForm } = this.props;
    form.validateFields((err, { purchaseDate, receivedBy, purchasedBy, items }) => {
      if (err) return;

      createPurchaseForm({
        variables: { purchaseDate, receivedBy, purchasedBy, physicalStoreId, items },
      })
        .then(() => {
          history.push(paths.purchaseFormsPath(physicalStoreId));
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  getItemsField() {
    const { getFieldDecorator } = this.props.form;
    const { physicalStoreId, stockItemsByPhysicalStoreId } = this.props;

    const rules = [
      {
        required: true,
        message: 'Please add some items.',
      },
    ];
    return getFieldDecorator('items', { rules })(
      <ItemsList
        physicalStoreId={physicalStoreId}
        stockItemsByPhysicalStore={stockItemsByPhysicalStoreId}
      />
    );
  }

  render() {
    const { loading, allKarkuns } = this.props;
    if (loading) return null;

    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <DateField
          fieldName="purchaseDate"
          fieldLabel="Purchase Date"
          required
          requiredMessage="Please input a purchase date."
          getFieldDecorator={getFieldDecorator}
        />
        <AutoCompleteField
          data={allKarkuns}
          fieldName="receivedBy"
          fieldLabel="Received By"
          placeholder="Received By"
          required
          requiredMessage="Please input a name in received by."
          getFieldDecorator={getFieldDecorator}
        />
        <AutoCompleteField
          data={allKarkuns}
          fieldName="purchasedBy"
          fieldLabel="Purchased By"
          placeholder="Purchased By"
          required
          requiredMessage="Please input a name in purchased by."
          getFieldDecorator={getFieldDecorator}
        />

        <Form.Item label="Purchased Items" {...formItemExtendedLayout}>
          {this.getItemsField()}
        </Form.Item>

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createPurchaseForm(
    $purchaseDate: String!
    $receivedBy: String!
    $purchasedBy: String!
    $physicalStoreId: String!
    $items: [ItemWithQuantityAndPriceInput]
  ) {
    createPurchaseForm(
      purchaseDate: $purchaseDate
      receivedBy: $receivedBy
      purchasedBy: $purchasedBy
      physicalStoreId: $physicalStoreId
      items: $items
    ) {
      _id
      purchaseDate
      receivedByName
      purchasedByName
      physicalStoreId
      items {
        stockItemId
        quantity
        price
      }
    }
  }
`;

const karkunsListQuery = gql`
  query allKarkuns {
    allKarkuns {
      _id
      name
    }
  }
`;

const stockItemsByPhysicalStoreId = gql`
  query stockItemsByPhysicalStoreId($physicalStoreId: String!) {
    stockItemsByPhysicalStoreId(physicalStoreId: $physicalStoreId) {
      _id
      itemTypeName
      itemCategoryName
      currentStockLevel
    }
  }
`;

export default compose(
  Form.create(),
  WithPhysicalStoreId(),
  graphql(formMutation, {
    name: 'createPurchaseForm',
    options: {
      refetchQueries: ['pagedPurchaseForms', 'purchaseFormsByStockItem', 'pagedStockItems'],
    },
  }),
  graphql(karkunsListQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(stockItemsByPhysicalStoreId, {
    props: ({ data }) => ({ ...data }),
    options: ({ physicalStoreId }) => ({ variables: { physicalStoreId } }),
  }),
  WithBreadcrumbs(['Inventory', 'Forms', 'Purchase Forms', 'New'])
)(NewForm);
