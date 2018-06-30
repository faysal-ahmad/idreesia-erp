import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import moment from 'moment';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';
import { filter } from 'lodash';

import { ItemsList } from '../common/items-list';
import { WithBreadcrumbs } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import {
  AutoCompleteField,
  DateField,
  SelectField,
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

    physicalStoresLoading: PropTypes.bool,
    karkunsListLoading: PropTypes.bool,
    stockItemsLoading: PropTypes.bool,
    formDataLoading: PropTypes.bool,

    purchaseFormById: PropTypes.object,
    allKarkuns: PropTypes.array,
    allPhysicalStores: PropTypes.array,
    allStockItems: PropTypes.array,
    updatePurchaseForm: PropTypes.func,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { purchaseFormById, allStockItems } = nextProps;
    if (purchaseFormById && allStockItems && !prevState.selectedPhysicalStoreId) {
      return {
        selectedPhysicalStoreId: purchaseFormById.physicalStoreId,
        stockItemsBySelectedPhysicalStore: filter(allStockItems, {
          physicalStoreId: purchaseFormById.physicalStoreId,
        }),
      };
    }

    return null;
  }

  state = {
    selectedPhysicalStoreId: null,
    stockItemsBySelectedPhysicalStore: [],
  };

  handleStoreChanged = value => {
    const { allStockItems } = this.props;
    this.setState({
      selectedPhysicalStoreId: value,
      stockItemsBySelectedPhysicalStore: filter(allStockItems, { physicalStoreId: value }),
    });
  };

  handleCancel = () => {
    const { history } = this.props;
    history.push(paths.purchaseFormsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      history,
      updatePurchaseForm,
      purchaseFormById: { _id },
    } = this.props;
    form.validateFields(
      (err, { purchaseDate, receivedBy, purchasedBy, physicalStoreId, items }) => {
        if (err) return;

        updatePurchaseForm({
          variables: { _id, purchaseDate, receivedBy, purchasedBy, physicalStoreId, items },
        })
          .then(() => {
            history.push(paths.purchaseFormsPath);
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  getItemsField() {
    const { purchaseFormById } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { selectedPhysicalStoreId, stockItemsBySelectedPhysicalStore } = this.state;

    const rules = [
      {
        required: true,
        message: 'Please add some items.',
      },
    ];
    return getFieldDecorator('items', { rules, initialValue: purchaseFormById.items })(
      <ItemsList
        physicalStoreId={selectedPhysicalStoreId}
        stockItemsByPhysicalStore={stockItemsBySelectedPhysicalStore}
      />
    );
  }

  render() {
    const {
      physicalStoresLoading,
      karkunsListLoading,
      stockItemsLoading,
      formDataLoading,
      purchaseFormById,
      allKarkuns,
      allPhysicalStores,
    } = this.props;
    if (physicalStoresLoading || karkunsListLoading || stockItemsLoading || formDataLoading) {
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
        <SelectField
          data={allPhysicalStores}
          fieldName="physicalStoreId"
          fieldLabel="Physical store"
          required
          requiredMessage="Please select a physical store."
          getFieldDecorator={getFieldDecorator}
          initialValue={this.state.selectedPhysicalStoreId}
          onChange={this.handleStoreChanged}
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

const physicalStoresListQuery = gql`
  query allPhysicalStores {
    allPhysicalStores {
      _id
      name
    }
  }
`;

const allStockItemsLitsQuery = gql`
  query allStockItems {
    allStockItems {
      _id
      physicalStoreId
      itemTypeName
      itemCategoryName
      currentStockLevel
    }
  }
`;

export default compose(
  Form.create(),
  graphql(formMutation, {
    name: 'updatePurchaseForm',
    options: {
      refetchQueries: ['pagedPurchaseForms', 'purchaseFormsByStockItem', 'pagedStockItems'],
    },
  }),
  graphql(physicalStoresListQuery, {
    props: ({ data }) => ({ physicalStoresLoading: data.loading, ...data }),
  }),
  graphql(karkunsListQuery, {
    props: ({ data }) => ({ karkunsListLoading: data.loading, ...data }),
  }),
  graphql(allStockItemsLitsQuery, {
    props: ({ data }) => ({ stockItemsLoading: data.loading, ...data }),
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
