import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import moment from 'moment';
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

class EditForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    physicalStoreId: PropTypes.string,

    karkunsListLoading: PropTypes.bool,
    stockItemsLoading: PropTypes.bool,
    formDataLoading: PropTypes.bool,

    purchaseFormById: PropTypes.object,
    allKarkuns: PropTypes.array,
    stockItemsByPhysicalStoreId: PropTypes.array,
    updatePurchaseForm: PropTypes.func,
  };

  handleCancel = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.purchaseFormsPath(physicalStoreId));
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      history,
      physicalStoreId,
      updatePurchaseForm,
      purchaseFormById: { _id },
    } = this.props;
    form.validateFields((err, { purchaseDate, receivedBy, purchasedBy, items }) => {
      if (err) return;

      updatePurchaseForm({
        variables: { _id, purchaseDate, receivedBy, purchasedBy, physicalStoreId, items },
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
    const { purchaseFormById, physicalStoreId, stockItemsByPhysicalStoreId } = this.props;
    const { getFieldDecorator } = this.props.form;

    const rules = [
      {
        required: true,
        message: 'Please add some items.',
      },
    ];
    return getFieldDecorator('items', { rules, initialValue: purchaseFormById.items })(
      <ItemsList
        physicalStoreId={physicalStoreId}
        stockItemsByPhysicalStore={stockItemsByPhysicalStoreId}
      />
    );
  }

  render() {
    const {
      karkunsListLoading,
      stockItemsLoading,
      formDataLoading,
      purchaseFormById,
      allKarkuns,
    } = this.props;
    if (karkunsListLoading || stockItemsLoading || formDataLoading) {
      return null;
    }

    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <DateField
          fieldName="purchaseDate"
          fieldLabel="Purchase Date"
          initialValue={moment(new Date(purchaseFormById.purchaseDate))}
          required
          requiredMessage="Please input a purchase date."
          getFieldDecorator={getFieldDecorator}
        />
        <AutoCompleteField
          data={allKarkuns}
          fieldName="receivedBy"
          fieldLabel="Received By"
          initialValue={purchaseFormById.receivedBy}
          required
          requiredMessage="Please input a name in received by."
          getFieldDecorator={getFieldDecorator}
        />
        <AutoCompleteField
          data={allKarkuns}
          fieldName="purchasedBy"
          fieldLabel="Purchaseed By"
          initialValue={purchaseFormById.purchasedBy}
          required
          requiredMessage="Please input a name in purchased by."
          getFieldDecorator={getFieldDecorator}
        />

        <Form.Item label="Purchaseed Items" {...formItemExtendedLayout}>
          {this.getItemsField()}
        </Form.Item>

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation updatePurchaseForm(
    $_id: String!
    $purchaseDate: String!
    $receivedBy: String!
    $purchasedBy: String!
    $physicalStoreId: String!
    $items: [ItemWithQuantityAndPriceInput]
  ) {
    updatePurchaseForm(
      _id: $_id
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

const formQuery = gql`
  query purchaseFormById($_id: String!) {
    purchaseFormById(_id: $_id) {
      _id
      purchaseDate
      receivedBy
      purchasedBy
      receivedByName
      purchasedByName
      physicalStoreId
      approvedOn
      items {
        stockItemId
        quantity
        price
        itemTypeName
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
    name: 'updatePurchaseForm',
    options: {
      refetchQueries: ['pagedPurchaseForms', 'purchaseFormsByStockItem', 'pagedStockItems'],
    },
  }),
  graphql(karkunsListQuery, {
    props: ({ data }) => ({ karkunsListLoading: data.loading, ...data }),
  }),
  graphql(stockItemsByPhysicalStoreId, {
    props: ({ data }) => ({ stockItemsLoading: data.loading, ...data }),
    options: ({ physicalStoreId }) => ({ variables: { physicalStoreId } }),
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { formId } = match.params;
      return { variables: { _id: formId } };
    },
  }),
  WithBreadcrumbs(['Inventory', 'Forms', 'Purchase Forms', 'Edit'])
)(EditForm);
