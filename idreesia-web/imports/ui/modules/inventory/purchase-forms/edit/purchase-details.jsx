import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { Divider, Form, message } from '/imports/ui/controls';
import { ItemsList } from '../../common/items-list';
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

import { PredefinedFilterNames } from 'meteor/idreesia-common/constants/hr';
import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';
import { RecordInfo } from '/imports/ui/modules/helpers/controls';

const FormStyle = {
  width: '800px',
};

const formItemExtendedLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 20 },
};

class EditForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    locationsLoading: PropTypes.bool,
    locationsByPhysicalStoreId: PropTypes.array,
    vendorsLoading: PropTypes.bool,
    vendorsByPhysicalStoreId: PropTypes.array,
    formDataLoading: PropTypes.bool,
    purchaseFormById: PropTypes.object,
    updatePurchaseForm: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
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
    form.validateFields(
      (
        err,
        {
          purchaseDate,
          locationId,
          vendorId,
          receivedBy,
          purchasedBy,
          items,
          notes,
        }
      ) => {
        if (err) return;

        const updatedItems = items.map(
          ({ stockItemId, quantity, isInflow, price }) => ({
            stockItemId,
            quantity,
            isInflow,
            price,
          })
        );
        updatePurchaseForm({
          variables: {
            _id,
            purchaseDate,
            locationId,
            vendorId,
            receivedBy: receivedBy._id,
            purchasedBy: purchasedBy._id,
            physicalStoreId,
            items: updatedItems,
            notes,
          },
        })
          .then(() => {
            history.goBack();
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
  };

  getItemsField() {
    const { form, purchaseFormById, physicalStoreId } = this.props;
    const { getFieldDecorator } = form;

    const rules = [
      {
        required: true,
        message: 'Please add some items.',
      },
    ];
    return getFieldDecorator('items', {
      rules,
      initialValue: purchaseFormById.items,
    })(
      <ItemsList
        refForm={form}
        defaultLabel="Purchased"
        inflowLabel="Purchased"
        outflowLabel="Returned"
        showPrice
        physicalStoreId={physicalStoreId}
      />
    );
  }

  render() {
    const {
      formDataLoading,
      vendorsLoading,
      locationsLoading,
      purchaseFormById,
      vendorsByPhysicalStoreId,
      locationsByPhysicalStoreId,
    } = this.props;
    if (formDataLoading || locationsLoading || vendorsLoading) return null;

    const { getFieldDecorator, isFieldsTouched } = this.props.form;

    return (
      <Fragment>
        <Form
          layout="horizontal"
          style={FormStyle}
          onSubmit={this.handleSubmit}
        >
          <DateField
            fieldName="purchaseDate"
            fieldLabel="Purchase Date"
            initialValue={moment(Number(purchaseFormById.purchaseDate))}
            required
            requiredMessage="Please input a purchase date."
            getFieldDecorator={getFieldDecorator}
          />
          <KarkunField
            required
            requiredMessage="Please select a name for Received By / Returned By."
            fieldName="receivedBy"
            fieldLabel="Received By / Returned By"
            placeholder="Received By / Returned By"
            initialValue={purchaseFormById.refReceivedBy}
            getFieldDecorator={getFieldDecorator}
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
            initialValue={purchaseFormById.refPurchasedBy}
            getFieldDecorator={getFieldDecorator}
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
            initialValue={purchaseFormById.vendorId}
            getFieldDecorator={getFieldDecorator}
          />

          <TreeSelectField
            data={locationsByPhysicalStoreId}
            showSearch
            fieldName="locationId"
            fieldLabel="For Location"
            placeholder="Select a Location"
            initialValue={purchaseFormById.locationId}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextAreaField
            fieldName="notes"
            fieldLabel="Notes"
            required={false}
            initialValue={purchaseFormById.notes}
            getFieldDecorator={getFieldDecorator}
          />

          <Divider orientation="left">Purchased / Returned Items</Divider>
          <Form.Item {...formItemExtendedLayout}>
            {this.getItemsField()}
          </Form.Item>

          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <RecordInfo record={purchaseFormById} />
      </Fragment>
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
    $locationId: String
    $vendorId: String
    $items: [ItemWithQuantityAndPriceInput]
    $notes: String
  ) {
    updatePurchaseForm(
      _id: $_id
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
      createdAt
      createdBy
      updatedAt
      updatedBy
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

const formQuery = gql`
  query purchaseFormById($_id: String!) {
    purchaseFormById(_id: $_id) {
      _id
      purchaseDate
      receivedBy
      purchasedBy
      physicalStoreId
      locationId
      vendorId
      approvedOn
      createdAt
      createdBy
      updatedAt
      updatedBy
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
  Form.create(),
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithVendorsByPhysicalStore(),
  WithLocationsByPhysicalStore(),
  graphql(formMutation, {
    name: 'updatePurchaseForm',
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
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ purchaseFormId }) => ({ variables: { _id: purchaseFormId } }),
  })
)(EditForm);
