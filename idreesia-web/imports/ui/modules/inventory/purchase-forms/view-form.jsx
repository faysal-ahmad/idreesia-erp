import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

import { flowRight, noop } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Divider, Form } from '/imports/ui/controls';
import { ItemsList } from '../common/items-list';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
} from '/imports/ui/modules/inventory/common/composers';
import {
  InputTextField,
  DateField,
  FormButtonsClose,
  InputTextAreaField,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';

const FormStyle = {
  width: '800px',
};

const formItemExtendedLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 20 },
};

class ViewForm extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    form: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    formDataLoading: PropTypes.bool,
    purchaseFormById: PropTypes.object,
  };

  handleClose = () => {
    const { history } = this.props;
    history.goBack();
  };

  render() {
    const { formDataLoading, purchaseFormById, physicalStoreId } = this.props;
    if (formDataLoading) {
      return null;
    }

    const rules = [
      {
        required: true,
        message: 'Please add some items.',
      },
    ];

    return (
      <Fragment>
        <Form layout="horizontal" style={FormStyle} onSubmit={noop}>
          <DateField
            fieldName="purchaseDate"
            fieldLabel="Purchase Date"
            initialValue={moment(Number(purchaseFormById.purchaseDate))}
            required
            requiredMessage="Please input a purchase date."
          />
          <InputTextField
            fieldName="vendorId"
            fieldLabel="Vendor"
            initialValue={
              purchaseFormById.refVendor ? purchaseFormById.refVendor.name : ''
            }
          />
          <InputTextField
            fieldName="receivedBy"
            fieldLabel="Received By"
            initialValue={purchaseFormById.refReceivedBy.name}
            required
            requiredMessage="Please input a name in received by."
          />
          <InputTextField
            fieldName="purchasedBy"
            fieldLabel="Purchased By"
            initialValue={purchaseFormById.refPurchasedBy.name}
            required
            requiredMessage="Please input a name in purchased by."
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
              defaultLabel="Purchased"
              inflowLabel="Purchased"
              outflowLabel="Returned"
              showPrice
              physicalStoreId={physicalStoreId}
            />
          </Form.Item>

          <FormButtonsClose handleClose={this.handleClose} />
        </Form>
        <AuditInfo record={purchaseFormById} />
      </Fragment>
    );
  }
}

const formQuery = gql`
  query purchaseFormById($_id: String!) {
    purchaseFormById(_id: $_id) {
      _id
      purchaseDate
      receivedBy
      purchasedBy
      physicalStoreId
      vendorId
      createdAt
      createdBy
      updatedAt
      updatedBy
      approvedOn
      approvedBy
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
      refVendor {
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
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { formId } = match.params;
      return { variables: { _id: formId } };
    },
  }),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Purchase Forms, View`;
    }
    return `Inventory, Purchase Forms, View`;
  })
)(ViewForm);
