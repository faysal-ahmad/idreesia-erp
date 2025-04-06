import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Divider, Form } from 'antd';

import { flowRight, noop } from 'meteor/idreesia-common/utilities/lodash';
import { ItemsList } from '../../common/items-list';
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
        <Form layout="horizontal" style={FormStyle} onFinish={noop}>
          <DateField
            fieldName="purchaseDate"
            fieldLabel="Purchase Date"
            initialValue={dayjs(Number(purchaseFormById.purchaseDate))}
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
              readOnly
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
  query purchaseFormById($_id: String!, $physicalStoreId: String!) {
    purchaseFormById(_id: $_id, physicalStoreId: $physicalStoreId) {
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
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { formId } = match.params;
      return { variables: { _id: formId } };
    },
  })
)(ViewForm);
