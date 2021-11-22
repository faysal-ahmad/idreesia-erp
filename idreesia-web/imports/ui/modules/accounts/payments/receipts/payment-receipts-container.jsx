import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { graphql } from 'react-apollo';
import ReactToPrint from 'react-to-print';
import { Button, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

import { PAYMENT_BY_ID } from '../gql';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import PaymentReceipts from './payment-receipts';

const PaymentReceiptsContainer = ({ paymentLoading, paymentById, history }) => {
  const paymentReceiptsRef = useRef(null);
  if (paymentLoading) return null;

  return (
    <>
      <ReactToPrint
        content={() => paymentReceiptsRef.current}
        trigger={() => (
          <Button size="large" type="primary" icon={<PrinterOutlined />}>
            Print Receipts
          </Button>
        )}
      />
      &nbsp;
      <Button
        size="large"
        type="primary"
        onClick={() => {
          history.goBack();
        }}
      >
        Back
      </Button>
      <Divider />
      <PaymentReceipts ref={paymentReceiptsRef} paymentById={paymentById} />
    </>
  );
};

PaymentReceiptsContainer.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,

  paymentLoading: PropTypes.bool,
  paymentById: PropTypes.object,
};

export default flowRight(
  WithQueryParams(),
  graphql(PAYMENT_BY_ID, {
    props: ({ data }) => ({ paymentLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { paymentId } = match.params;
      return { variables: { _id: paymentId } };
    },
  }),
  WithBreadcrumbs(['Accounts', 'Payments', 'Payment Receipts'])
)(PaymentReceiptsContainer);
