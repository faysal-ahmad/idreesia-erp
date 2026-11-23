import React, { useRef } from 'react';
import { type RouteComponentProps } from 'react-router-dom';
import { useQuery } from '@apollo/client/react';
import { PrinterOutlined } from '@ant-design/icons';
import { Button, Divider, Empty, Spin } from 'antd';
import ReactToPrint from 'react-to-print';

import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';

import { formatDate, formatMoney, formatQuantity } from '../common/format';
import { PURCHASING_ORDER_BY_ID } from './gql';

const cell: React.CSSProperties = { border: '1px solid #999', padding: '4px 8px' };

const OrderPrint = ({ match, history }: RouteComponentProps<{ orderId: string }>) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { orderId } = match.params;
  const { data, loading } = useQuery(PURCHASING_ORDER_BY_ID, { variables: { _id: orderId } });
  const order = data?.purchasingOrderById;

  useDynamicBreadcrumbs(['Purchasing', 'Purchase Orders', order?.number || '', 'Print']);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin size="large" />
      </div>
    );
  }
  if (!order) return <Empty description="Purchase order not found" style={{ padding: '80px 0' }} />;

  const lines = (order.lines ?? []).filter((l) => l != null);

  return (
    <>
      <div>
        <ReactToPrint
          content={() => printRef.current!}
          trigger={() => (
            <Button size="large" type="primary" icon={<PrinterOutlined />}>
              Print
            </Button>
          )}
        />
        &nbsp;
        <Button size="large" type="primary" onClick={() => history.goBack()}>
          Back
        </Button>
      </div>
      <Divider />
      <div ref={printRef} style={{ padding: 24, maxWidth: 900, background: '#fff', color: '#000' }}>
        <h2 style={{ textAlign: 'center', marginBottom: 4 }}>Purchase Order</h2>
        <h3 style={{ textAlign: 'center', marginTop: 0 }}>{order.number}</h3>
        <table style={{ width: '100%', marginBottom: 16 }}>
          <tbody>
            <tr>
              <td><strong>Vendor:</strong> {order.vendor?.name}</td>
              <td style={{ textAlign: 'right' }}><strong>Date:</strong> {formatDate(order.orderDate)}</td>
            </tr>
            <tr>
              <td><strong>Deliver to:</strong> {order.deliveryAddress}</td>
              <td style={{ textAlign: 'right' }}>
                <strong>Expected:</strong> {formatDate(order.expectedDeliveryDate)}
              </td>
            </tr>
            {order.paymentTermsDays != null ? (
              <tr>
                <td colSpan={2}><strong>Payment terms:</strong> {order.paymentTermsDays} days</td>
              </tr>
            ) : null}
          </tbody>
        </table>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['#', 'Item', 'Unit', 'Qty', 'Unit Price', 'Tax %', 'Total'].map((h) => (
                <th key={h} style={{ ...cell, background: '#eee', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((l, i) => (
              <tr key={l!._id!}>
                <td style={cell}>{i + 1}</td>
                <td style={cell}>{l!.description}</td>
                <td style={cell}>{l!.unit}</td>
                <td style={{ ...cell, textAlign: 'right' }}>{formatQuantity(l!.quantity)}</td>
                <td style={{ ...cell, textAlign: 'right' }}>{formatMoney(l!.unitPrice)}</td>
                <td style={{ ...cell, textAlign: 'right' }}>{l!.taxRate ?? 0}</td>
                <td style={{ ...cell, textAlign: 'right' }}>{formatMoney((l!.quantity ?? 0) * (l!.unitPrice ?? 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table style={{ marginLeft: 'auto', marginTop: 12 }}>
          <tbody>
            <tr><td>Subtotal</td><td style={{ textAlign: 'right', paddingLeft: 24 }}>{formatMoney(order.subtotal)}</td></tr>
            <tr><td>Tax</td><td style={{ textAlign: 'right', paddingLeft: 24 }}>{formatMoney(order.taxTotal)}</td></tr>
            {order.discount ? (
              <tr><td>Discount</td><td style={{ textAlign: 'right', paddingLeft: 24 }}>-{formatMoney(order.discount)}</td></tr>
            ) : null}
            {order.shipping ? (
              <tr><td>Shipping</td><td style={{ textAlign: 'right', paddingLeft: 24 }}>{formatMoney(order.shipping)}</td></tr>
            ) : null}
            <tr>
              <td><strong>Total</strong></td>
              <td style={{ textAlign: 'right', paddingLeft: 24 }}><strong>{formatMoney(order.total)}</strong></td>
            </tr>
          </tbody>
        </table>
        {order.notes ? <p style={{ marginTop: 16 }}><strong>Notes:</strong> {order.notes}</p> : null}
      </div>
    </>
  );
};

export default OrderPrint;
