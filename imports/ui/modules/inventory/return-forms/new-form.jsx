import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import gql from 'graphql-tag';
import { compose, graphql } from 'react-apollo';

import { ItemsList } from '../common/items-list';
import { WithBreadcrumbs } from '/imports/ui/composers';
import { InventorySubModulePaths as paths } from '/imports/ui/modules/inventory';
import {
  WithKarkuns,
  WithPhysicalStoreId,
  WithStockItemsByPhysicalStore,
} from '/imports/ui/modules/inventory/common/composers';
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

    stockItemsLoading: PropTypes.bool,
    stockItemsByPhysicalStoreId: PropTypes.array,
    karkunsListLoading: PropTypes.bool,
    allKarkuns: PropTypes.array,

    loading: PropTypes.bool,
    createReturnForm: PropTypes.func,
  };

  handleCancel = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.returnFormsPath(physicalStoreId));
  };

  handleSubmit = e => {
    e.preventDefault();
    const { form, history, physicalStoreId, createReturnForm } = this.props;
    form.validateFields((err, { returnDate, receivedBy, returnedBy, items }) => {
      if (err) return;

      createReturnForm({
        variables: { returnDate, receivedBy, returnedBy, physicalStoreId, items },
      })
        .then(() => {
          history.push(paths.returnFormsPath(physicalStoreId));
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

export default compose(
  Form.create(),
  WithKarkuns(),
  WithPhysicalStoreId(),
  WithStockItemsByPhysicalStore(),
  graphql(formMutation, {
    name: 'createReturnForm',
    options: {
      refetchQueries: ['pagedReturnForms', 'returnFormsByStockItem', 'pagedStockItems'],
    },
  }),
  WithBreadcrumbs(['Inventory', 'Forms', 'Return Forms', 'New'])
)(NewForm);
