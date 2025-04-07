import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { graphql } from 'react-apollo';
import { Divider, Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { PredefinedFilterNames } from 'meteor/idreesia-common/constants/hr';
import {
  DateField,
  SelectField,
  FormButtonsSaveCancel,
  InputTextAreaField,
  TreeSelectField,
} from '/imports/ui/modules/helpers/fields';
import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';
import { AuditInfo } from '/imports/ui/modules/common';
import { ItemsList } from '../../common/items-list';
import { UPDATE_PURCHASE_FORM } from '../gql';

const FormStyle = {
  width: '900px',
};

const formItemExtendedLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 20 },
};

class PurchaseDetails extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,
    locationsByPhysicalStoreId: PropTypes.array,
    purchaseFormById: PropTypes.object,
    vendorsByPhysicalStoreId: PropTypes.array,

    updatePurchaseForm: PropTypes.func,
  };
  
  state = {
    isFieldsTouched: false,
  };

  formRef = React.createRef();

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
    const {
      history,
      physicalStoreId,
      updatePurchaseForm,
      purchaseFormById: { _id },
    } = this.props;

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
        physicalStoreId,
        purchaseDate,
        locationId,
        vendorId,
        receivedBy: receivedBy._id,
        purchasedBy: purchasedBy._id,
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
  };

  render() {
    const {
      purchaseFormById,
      vendorsByPhysicalStoreId,
      locationsByPhysicalStoreId,
      physicalStoreId,
    } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;

    const rules = [
      {
        required: true,
        message: 'Please add some items.',
      },
    ];

    return (
      <>
        <Form ref={this.formRef} layout="horizontal" style={FormStyle} onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
          <DateField
            fieldName="purchaseDate"
            fieldLabel="Purchase Date"
            initialValue={dayjs(Number(purchaseFormById.purchaseDate))}
            required
            requiredMessage="Please input a purchase date."
          />
          <KarkunField
            required
            requiredMessage="Please select a name for Received By / Returned By."
            fieldName="receivedBy"
            fieldLabel="Received By / Returned By"
            placeholder="Received By / Returned By"
            initialValue={purchaseFormById.refReceivedBy}
            predefinedFilterStoreId={physicalStoreId}
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
            predefinedFilterStoreId={physicalStoreId}
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
          />

          <TreeSelectField
            data={locationsByPhysicalStoreId}
            showSearch
            fieldName="locationId"
            fieldLabel="For Location"
            placeholder="Select a Location"
            initialValue={purchaseFormById.locationId}
          />

          <InputTextAreaField
            fieldName="notes"
            fieldLabel="Notes"
            required={false}
            initialValue={purchaseFormById.notes}
          />

          <Divider orientation="left">Purchased / Returned Items</Divider>
          <Form.Item name="items" initialValue={purchaseFormById.items} rules={rules} {...formItemExtendedLayout}>
            <ItemsList
              showPrice
              defaultLabel="Purchased"
              inflowLabel="Purchased"
              outflowLabel="Returned"
              physicalStoreId={physicalStoreId}
              refForm={this.formRef.current}
            />
          </Form.Item>

          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <AuditInfo record={purchaseFormById} />
      </>
    );
  }
}

export default flowRight(
  graphql(UPDATE_PURCHASE_FORM, {
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
  })
)(PurchaseDetails);
