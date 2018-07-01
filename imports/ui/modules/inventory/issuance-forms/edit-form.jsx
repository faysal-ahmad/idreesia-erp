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

    issuanceFormById: PropTypes.object,
    allKarkuns: PropTypes.array,
    allAccessiblePhysicalStores: PropTypes.array,
    allStockItems: PropTypes.array,
    updateIssuanceForm: PropTypes.func,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { issuanceFormById, allStockItems } = nextProps;
    if (issuanceFormById && allStockItems && !prevState.selectedPhysicalStoreId) {
      return {
        selectedPhysicalStoreId: issuanceFormById.physicalStoreId,
        stockItemsBySelectedPhysicalStore: filter(allStockItems, {
          physicalStoreId: issuanceFormById.physicalStoreId,
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
    history.push(paths.issuanceFormsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      history,
      updateIssuanceForm,
      issuanceFormById: { _id },
    } = this.props;
    form.validateFields((err, { issueDate, issuedBy, issuedTo, physicalStoreId, items }) => {
      if (err) return;

      updateIssuanceForm({
        variables: { _id, issueDate, issuedBy, issuedTo, physicalStoreId, items },
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
    const { issuanceFormById } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { selectedPhysicalStoreId, stockItemsBySelectedPhysicalStore } = this.state;

    const rules = [
      {
        required: true,
        message: 'Please add some items.',
      },
    ];
    return getFieldDecorator('items', { rules, initialValue: issuanceFormById.items })(
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
      issuanceFormById,
      allKarkuns,
      allAccessiblePhysicalStores,
    } = this.props;
    if (physicalStoresLoading || karkunsListLoading || stockItemsLoading || formDataLoading) {
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
        <SelectField
          data={allAccessiblePhysicalStores}
          fieldName="physicalStoreId"
          fieldLabel="Physical store"
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
    name: 'updateIssuanceForm',
    options: {
      refetchQueries: ['pagedIssuanceForms', 'issuanceFormsByStockItem', 'pagedStockItems'],
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
  WithBreadcrumbs(['Inventory', 'Forms', 'Issuance Forms', 'Edit'])
)(EditForm);
