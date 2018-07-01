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
    allAccessiblePhysicalStores: PropTypes.array,
    allStockItems: PropTypes.array,
    createIssuanceForm: PropTypes.func,
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
    history.push(paths.issuanceFormsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, createIssuanceForm } = this.props;
    form.validateFields((err, { issueDate, issuedBy, issuedTo, physicalStoreId, items }) => {
      if (err) return;

      createIssuanceForm({
        variables: { issueDate, issuedBy, issuedTo, physicalStoreId, items },
      })
        .then(() => {
          history.push(paths.issuanceFormsPath);
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
    const { loading, allKarkuns, allAccessiblePhysicalStores } = this.props;
    if (loading) return null;

    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <DateField
          fieldName="issueDate"
          fieldLabel="Issue Date"
          required
          requiredMessage="Please input an issue date."
          getFieldDecorator={getFieldDecorator}
        />
        <AutoCompleteField
          data={allKarkuns}
          fieldName="issuedBy"
          fieldLabel="Issued By"
          placeholder="Issued By"
          required
          requiredMessage="Please input a name in issued by."
          getFieldDecorator={getFieldDecorator}
        />
        <AutoCompleteField
          data={allKarkuns}
          fieldName="issuedTo"
          fieldLabel="Issued To"
          placeholder="Issued To"
          required
          requiredMessage="Please input a name in issued to."
          getFieldDecorator={getFieldDecorator}
        />
        <SelectField
          data={allAccessiblePhysicalStores}
          fieldName="physicalStoreId"
          fieldLabel="Physical store"
          placeholder="Physical store"
          required
          requiredMessage="Please select a physical store."
          getFieldDecorator={getFieldDecorator}
          initialValue={this.state.selectedPhysicalStoreId}
          onChange={this.handleStoreChanged}
        />

        <Form.Item label="Issued Items" {...formItemExtendedLayout}>
          {this.getItemsField()}
        </Form.Item>

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation createIssuanceForm(
    $issueDate: String!
    $issuedBy: String!
    $issuedTo: String!
    $physicalStoreId: String!
    $items: [ItemWithQuantityInput]
  ) {
    createIssuanceForm(
      issueDate: $issueDate
      issuedBy: $issuedBy
      issuedTo: $issuedTo
      physicalStoreId: $physicalStoreId
      items: $items
    ) {
      _id
      issueDate
      issuedByName
      issuedToName
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
  query allAccessiblePhysicalStores {
    allAccessiblePhysicalStores {
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
    name: 'createIssuanceForm',
    options: {
      refetchQueries: ['pagedIssuanceForms', 'issuanceFormsByStockItem', 'pagedStockItems'],
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
  WithBreadcrumbs(['Inventory', 'Forms', 'Issuance Forms', 'New'])
)(NewForm);
