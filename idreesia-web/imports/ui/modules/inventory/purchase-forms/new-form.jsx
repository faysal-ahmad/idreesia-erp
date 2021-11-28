import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Divider, Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { PredefinedFilterNames } from 'meteor/idreesia-common/constants/hr';

import { ItemsList } from '../common/items-list';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
  WithVendorsByPhysicalStore,
  WithLocationsByPhysicalStore,
} from '/imports/ui/modules/inventory/common/composers';
import {
  DateField,
  SelectField,
  FormButtonsSaveCancel,
  InputTextAreaField,
  TreeSelectField,
} from '/imports/ui/modules/helpers/fields';

import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';

const FormStyle = {
  width: '800px',
};

const formItemExtendedLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 20 },
};

class NewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    vendorsLoading: PropTypes.bool,
    vendorsByPhysicalStoreId: PropTypes.array,
    locationsLoading: PropTypes.bool,
    locationsByPhysicalStoreId: PropTypes.array,
    createPurchaseForm: PropTypes.func,
  };
  
  state = {
    isFieldsTouched: false,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  }

  handleFinish = ({
    purchaseDate,
    locationId,
    vendorId,
    receivedBy,
    purchasedBy,
    items,
    notes,
  }) => {
    const { history, physicalStoreId, createPurchaseForm } = this.props;
    createPurchaseForm({
      variables: {
        purchaseDate,
        locationId,
        vendorId,
        receivedBy: receivedBy._id,
        purchasedBy: purchasedBy._id,
        physicalStoreId,
        items,
        notes,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch(error => {
        message.error(error.message, 5);
      });
  };

  render() {
    const {
      vendorsLoading,
      locationsLoading,
      locationsByPhysicalStoreId,
      vendorsByPhysicalStoreId,
      physicalStoreId,
    } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (locationsLoading || vendorsLoading) return null;

    const rules = [
      {
        required: true,
        message: 'Please add some items.',
      },
    ];

    return (
      <Form layout="horizontal" style={FormStyle} onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <DateField
          fieldName="purchaseDate"
          fieldLabel="Purchase Date"
          required
          requiredMessage="Please input a purchase date."
        />
        <KarkunField
          required
          requiredMessage="Please select a name for Received By / Returned By."
          fieldName="receivedBy"
          fieldLabel="Received By / Returned By"
          placeholder="Received By / Returned By"
          predefinedFilterName={
            PredefinedFilterNames.PURCHASE_FORMS_RECEIVED_BY_RETURNED_BY
          }
        />
        <KarkunField
          required
          requiredMessage="Please select a name for Purchased By / Returned To."
          fieldName="purchasedBy"
          fieldLabel="Purchased By / Returned To"
          placeholder="Purchased By / Returned To"
          predefinedFilterName={
            PredefinedFilterNames.PURCHASE_FORMS_PURCHASED_BY_RETURNED_TO
          }
        />

        <SelectField
          data={vendorsByPhysicalStoreId}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="vendorId"
          fieldLabel="Vendor"
        />

        <TreeSelectField
          data={locationsByPhysicalStoreId}
          showSearch
          fieldName="locationId"
          fieldLabel="For Location"
          placeholder="Select a Location"
        />

        <InputTextAreaField
          fieldName="notes"
          fieldLabel="Notes"
          required={false}
        />

        <Divider orientation="left">Purchased / Returned Items</Divider>
        <Form.Item name="items" rules={rules} {...formItemExtendedLayout}>
          <ItemsList
            defaultLabel="Purchased"
            inflowLabel="Purchased"
            outflowLabel="Returned"
            showPrice
            physicalStoreId={physicalStoreId}
          />
        </Form.Item>

        <FormButtonsSaveCancel
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
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
    $locationId: String
    $vendorId: String
    $items: [ItemWithQuantityAndPriceInput]
    $notes: String
  ) {
    createPurchaseForm(
      purchaseDate: $purchaseDate
      receivedBy: $receivedBy
      purchasedBy: $purchasedBy
      physicalStoreId: $physicalStoreId
      locationId: $locationId
      vendorId: $vendorId
      items: $items
      notes: $notes
    ) {
      _id
      purchaseDate
      physicalStoreId
      locationId
      vendorId
      items {
        stockItemId
        quantity
        isInflow
        price
      }
      refReceivedBy {
        _id
        name
      }
      refPurchasedBy {
        _id
        name
      }
      notes
    }
  }
`;

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithVendorsByPhysicalStore(),
  WithLocationsByPhysicalStore(),
  graphql(formMutation, {
    name: 'createPurchaseForm',
    options: {
      refetchQueries: [
        'pagedPurchaseForms',
        'purchaseFormsByStockItem',
        'pagedStockItems',
        'vendorsByPhysicalStoreId',
        'purchaseFormsByMonth',
      ],
    },
  }),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Purchase Forms, New`;
    }
    return `Inventory, Purchase Forms, New`;
  })
)(NewForm);
