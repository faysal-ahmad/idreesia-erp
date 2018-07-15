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

    issuanceFormById: PropTypes.object,
    allKarkuns: PropTypes.array,
    stockItemsByPhysicalStoreId: PropTypes.array,
    updateIssuanceForm: PropTypes.func,
  };

  handleCancel = () => {
    const { history, physicalStoreId } = this.props;
    history.push(paths.issuanceFormsPath(physicalStoreId));
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      history,
      physicalStoreId,
      updateIssuanceForm,
      issuanceFormById: { _id },
    } = this.props;
    form.validateFields((err, { issueDate, issuedBy, issuedTo, items }) => {
      if (err) return;

      const updatedItems = items.map(({ stockItemId, quantity }) => ({ stockItemId, quantity }));
      updateIssuanceForm({
        variables: { _id, issueDate, issuedBy, issuedTo, physicalStoreId, items: updatedItems },
      })
        .then(() => {
          history.push(paths.issuanceFormsPath(physicalStoreId));
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  getItemsField() {
    const { issuanceFormById, physicalStoreId, stockItemsByPhysicalStoreId } = this.props;
    const { getFieldDecorator } = this.props.form;

    const rules = [
      {
        required: true,
        message: 'Please add some items.',
      },
    ];
    return getFieldDecorator('items', { rules, initialValue: issuanceFormById.items })(
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
      issuanceFormById,
      allKarkuns,
    } = this.props;
    if (karkunsListLoading || stockItemsLoading || formDataLoading) {
      return null;
    }

    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
        <DateField
          fieldName="issueDate"
          fieldLabel="Issue Date"
          initialValue={moment(new Date(issuanceFormById.issueDate))}
          required
          requiredMessage="Please input an issue date."
          getFieldDecorator={getFieldDecorator}
        />
        <AutoCompleteField
          data={allKarkuns}
          fieldName="issuedBy"
          fieldLabel="Issued By"
          initialValue={issuanceFormById.issuedBy}
          required
          requiredMessage="Please input a name in issued by."
          getFieldDecorator={getFieldDecorator}
        />
        <AutoCompleteField
          data={allKarkuns}
          fieldName="issuedTo"
          fieldLabel="Issued To"
          initialValue={issuanceFormById.issuedTo}
          required
          requiredMessage="Please input a name in issued to."
          getFieldDecorator={getFieldDecorator}
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
  mutation updateIssuanceForm(
    $_id: String!
    $issueDate: String!
    $issuedBy: String!
    $issuedTo: String!
    $physicalStoreId: String!
    $items: [ItemWithQuantityInput]
  ) {
    updateIssuanceForm(
      _id: $_id
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

const formQuery = gql`
  query issuanceFormById($_id: String!) {
    issuanceFormById(_id: $_id) {
      _id
      issueDate
      issuedBy
      issuedTo
      issuedByName
      issuedToName
      physicalStoreId
      approvedOn
      items {
        stockItemId
        quantity
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
    name: 'updateIssuanceForm',
    options: {
      refetchQueries: ['pagedIssuanceForms', 'issuanceFormsByStockItem', 'pagedStockItems'],
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
  WithBreadcrumbs(['Inventory', 'Forms', 'Issuance Forms', 'Edit'])
)(EditForm);
