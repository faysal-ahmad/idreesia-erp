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

    loading: PropTypes.bool,
    returnFormById: PropTypes.object,
    allKarkuns: PropTypes.array,
    allPhysicalStores: PropTypes.array,
    allStockItems: PropTypes.array,
    updateReturnForm: PropTypes.func,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { returnFormById, allStockItems } = nextProps;
    if (returnFormById && allStockItems && !prevState.selectedPhysicalStoreId) {
      return {
        selectedPhysicalStoreId: returnFormById.physicalStoreId,
        stockItemsBySelectedPhysicalStore: filter(allStockItems, {
          physicalStoreId: returnFormById.physicalStoreId,
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
    history.push(paths.returnFormsPath);
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      history,
      updateReturnForm,
      returnFormById: { _id },
    } = this.props;
    form.validateFields((err, { returnDate, receivedBy, returnedBy, physicalStoreId, items }) => {
      if (err) return;

      updateReturnForm({
        variables: { _id, returnDate, receivedBy, returnedBy, physicalStoreId, items },
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
    const { returnFormById } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { selectedPhysicalStoreId, stockItemsBySelectedPhysicalStore } = this.state;

    const rules = [
      {
        required: true,
        message: 'Please add some items.',
      },
    ];
    return getFieldDecorator('items', { rules, initialValue: returnFormById.items })(
      <ItemsList
        physicalStoreId={selectedPhysicalStoreId}
        stockItemsByPhysicalStore={stockItemsBySelectedPhysicalStore}
      />
    );
  }

  render() {
    const { loading, returnFormById, allKarkuns, allPhysicalStores } = this.props;
    if (loading) return null;

    const { getFieldDecorator } = this.props.form;

    return (
      <Form layout="horizontal" onSubmit={this.handleSubmit}>
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

        <Form.Item label="Returned Items" {...formItemExtendedLayout}>
          {this.getItemsField()}
        </Form.Item>

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
  ) {
    updateReturnForm(
      _id: $_id
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
    name: 'updateReturnForm',
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
  graphql(formQuery, {
    props: ({ data }) => ({ ...data }),
    options: ({ match }) => {
      const { formId } = match.params;
      return { variables: { _id: formId } };
    },
  }),
  WithBreadcrumbs(['Inventory', 'Forms', 'Return Forms', 'Edit'])
)(EditForm);
