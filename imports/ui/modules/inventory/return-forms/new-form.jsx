import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
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

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,

    loading: PropTypes.bool,
    allKarkuns: PropTypes.array,
    allPhysicalStores: PropTypes.array,
    allStockItems: PropTypes.array,
    createReturnForm: PropTypes.func,
  };

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
    history.push(paths.returnFormsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, createReturnForm } = this.props;
    form.validateFields((err, { returnDate, receivedBy, returnedBy, physicalStoreId, items }) => {
      if (err) return;

      createReturnForm({
        variables: { returnDate, receivedBy, returnedBy, physicalStoreId, items },
      })
        .then(() => {
          history.push(paths.returnFormsPath);
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  getItemsField() {
    const { getFieldDecorator } = this.props.form;
    const { selectedPhysicalStoreId, stockItemsBySelectedPhysicalStore } = this.state;

    const rules = [
      {
        required: true,
        message: 'Please add some items.',
      },
    ];
    return getFieldDecorator('items', { rules })(
      <ItemsList
        physicalStoreId={selectedPhysicalStoreId}
        stockItemsByPhysicalStore={stockItemsBySelectedPhysicalStore}
      />
    );
  }

  render() {
    const { loading, allKarkuns, allPhysicalStores } = this.props;
    if (loading) return null;

    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <DateField
          fieldName="returnDate"
          fieldLabel="Return Date"
          required
          requiredMessage="Please input a return date."
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
          fieldName="returnedBy"
          fieldLabel="Returned By"
          placeholder="Returned By"
          required
          requiredMessage="Please input a name in returned by."
          getFieldDecorator={getFieldDecorator}
        />
        <SelectField
          data={allPhysicalStores}
          fieldName="physicalStoreId"
          fieldLabel="Physical store"
          placeholder="Physical store"
          required
          requiredMessage="Please select a physical store."
          getFieldDecorator={getFieldDecorator}
          initialValue={this.state.selectedPhysicalStoreId}
          onChange={this.handleStoreChanged}
        />

        <Form.Item label="Returned Items" {...formItemExtendedLayout}>
          {this.getItemsField()}
        </Form.Item>

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createReturnForm(
    $returnDate: String!
    $receivedBy: String!
    $returnedBy: String!
    $physicalStoreId: String!
    $items: [ItemWithQuantityInput]
  ) {
    createReturnForm(
      returnDate: $returnDate
      receivedBy: $receivedBy
      returnedBy: $returnedBy
      physicalStoreId: $physicalStoreId
      items: $items
    ) {
      _id
      returnDate
      receivedByName
      returnedByName
      physicalStoreId
      items {
        stockItemId
        quantity
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
    name: 'createReturnForm',
    options: {
      refetchQueries: ['pagedReturnForms'],
    },
  }),
  graphql(physicalStoresListQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(karkunsListQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  graphql(allStockItemsLitsQuery, {
    props: ({ data }) => ({ ...data }),
  }),
  WithBreadcrumbs(['Inventory', 'Forms', 'Return Forms', 'New'])
)(NewForm);
