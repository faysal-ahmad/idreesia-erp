import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, message } from 'antd';
import moment from 'moment';
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
  InputTextAreaField,
} from '/imports/ui/modules/helpers/fields';

const FormStyle = {
  width: "800px",
};

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

    stockItemsLoading: PropTypes.bool,
    stockItemsByPhysicalStoreId: PropTypes.array,
    karkunsListLoading: PropTypes.bool,
    allKarkuns: PropTypes.array,

    formDataLoading: PropTypes.bool,
    returnFormById: PropTypes.object,
    updateReturnForm: PropTypes.func,
  };

  handleCancel = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.returnFormsPath(physicalStoreId));
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      history,
      physicalStoreId,
      updateReturnForm,
      returnFormById: { _id },
    } = this.props;
    form.validateFields((err, { returnDate, receivedBy, returnedBy, items, notes }) => {
      if (err) return;

      const updatedItems = items.map(({ stockItemId, quantity }) => ({ stockItemId, quantity }));
      updateReturnForm({
        variables: {
          _id,
          returnDate,
          receivedBy,
          returnedBy,
          physicalStoreId,
          items: updatedItems,
          notes,
        },
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
    const { returnFormById, physicalStoreId, stockItemsByPhysicalStoreId } = this.props;
    const { getFieldDecorator } = this.props.form;

    const rules = [
      {
        required: true,
        message: 'Please add some items.',
      },
    ];
    return getFieldDecorator('items', { rules, initialValue: returnFormById.items })(
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
      returnFormById,
      allKarkuns,
    } = this.props;
    if (karkunsListLoading || stockItemsLoading || formDataLoading) {
      return null;
    }

    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" style={FormStyle} onSubmit={this.handleSubmit}>
        <DateField
          fieldName="returnDate"
          fieldLabel="Return Date"
          initialValue={moment(new Date(returnFormById.returnDate))}
          required
          requiredMessage="Please input a return date."
          getFieldDecorator={getFieldDecorator}
        />
        <AutoCompleteField
          data={allKarkuns}
          fieldName="receivedBy"
          fieldLabel="Received By"
          initialValue={returnFormById.receivedBy}
          required
          requiredMessage="Please input a name in received by."
          getFieldDecorator={getFieldDecorator}
        />
        <AutoCompleteField
          data={allKarkuns}
          fieldName="returnedBy"
          fieldLabel="Returned By"
          initialValue={returnFormById.returnedBy}
          required
          requiredMessage="Please input a name in returned by."
          getFieldDecorator={getFieldDecorator}
        />

        <Form.Item label="Returned Items" {...formItemExtendedLayout}>
          {this.getItemsField()}
        </Form.Item>

        <InputTextAreaField
          fieldName="notes"
          fieldLabel="Notes"
          required={false}
          initialValue={returnFormById.notes}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel handleCancel={this.handleCancel} />
      </Form>
    );
  }
}

const formMutation = gql`
  mutation updateReturnForm(
    $_id: String!
    $returnDate: String!
    $receivedBy: String!
    $returnedBy: String!
    $physicalStoreId: String!
    $items: [ItemWithQuantityInput]
    $notes: String
  ) {
    updateReturnForm(
      _id: $_id
      returnDate: $returnDate
      receivedBy: $receivedBy
      returnedBy: $returnedBy
      physicalStoreId: $physicalStoreId
      items: $items
      notes: $notes
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
      notes
    }
  }
`;

const formQuery = gql`
  query returnFormById($_id: String!) {
    returnFormById(_id: $_id) {
      _id
      returnDate
      receivedBy
      returnedBy
      receivedByName
      returnedByName
      physicalStoreId
      approvedOn
      items {
        stockItemId
        quantity
        itemTypeName
      }
      notes
    }
  }
`;

export default compose(
  Form.create(),
  WithKarkuns(),
  WithPhysicalStoreId(),
  WithStockItemsByPhysicalStore(),
  graphql(formMutation, {
    name: 'updateReturnForm',
    options: {
      refetchQueries: ['pagedReturnForms', 'returnFormsByStockItem', 'pagedStockItems'],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { formId } = match.params;
      return { variables: { _id: formId } };
    },
  }),
  WithBreadcrumbs(['Inventory', 'Forms', 'Return Forms', 'Edit'])
)(EditForm);
