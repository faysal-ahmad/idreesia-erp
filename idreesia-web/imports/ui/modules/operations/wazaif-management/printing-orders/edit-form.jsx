import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { graphql } from 'react-apollo';
import { Divider, Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { WithAllWazaifVendors } from 'meteor/idreesia-common/composers/wazaif';
import {
  DateField,
  FormButtonsSaveCancel,
  InputTextAreaField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';
import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';

import { ItemsList } from '../common/items-list';
import { WAZAIF_PRINTING_ORDER_BY_ID, UPDATE_WAZAIF_PRINTING_ORDER } from './gql';

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
    allWazaifVendors: PropTypes.array,
    allWazaifVendorsLoading: PropTypes.bool,
    formDataLoading: PropTypes.bool,
    updateWazaifPrintingOrder: PropTypes.func,
    wazaifPrintingOrderById: PropTypes.object,
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
    vendorId,
    orderDate,
    orderedBy,
    deliveryDate,
    receivedBy,
    items,
    notes,
    status,
  }) => {
    const {
      history,
      updateWazaifPrintingOrder,
      wazaifPrintingOrderById: { _id },
    } = this.props;

    updateWazaifPrintingOrder({
      variables: {
        _id,
        vendorId,
        orderDate,
        orderedBy: orderedBy._id,
        deliveryDate,
        receivedBy: receivedBy?._id,
        items,
        notes,
        status,
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
      allWazaifVendorsLoading,
      allWazaifVendors,
      formDataLoading,
      wazaifPrintingOrderById,
    } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (formDataLoading || allWazaifVendorsLoading) return null;

    const rules = [
      {
        required: true,
        message: 'Please add some items.',
      },
    ];

    const wazaifItems = wazaifPrintingOrderById.items.map(item => ({
      wazeefaId: item.wazeefaId,
      formattedName: item.formattedName,
      packets: item.packets,
      wazaifCount: item.wazaifCount,
    }));

    return (
      <>
        <Form ref={this.formRef} layout="horizontal" style={FormStyle} onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
          <DateField
            fieldName="orderDate"
            fieldLabel="Ordered Date"
            initialValue={moment(Number(wazaifPrintingOrderById.orderDate))}
            required
            requiredMessage="Please input a value for ordered date."
          />
          <SelectField
            data={allWazaifVendors}
            getDataValue={({ _id }) => _id}
            getDataText={({ name }) => name}
            initialValue={wazaifPrintingOrderById.vendorId}
            allowClear
            fieldName="vendorId"
            fieldLabel="Vendor"
          />
          <KarkunField
            required
            requiredMessage="Please select a karkun name for Ordered By."
            fieldName="orderedBy"
            fieldLabel="Ordered By"
            placeholder="Ordered By"
            initialValue={wazaifPrintingOrderById.refOrderedBy}
          />
          <DateField
            fieldName="deliveryDate"
            fieldLabel="Delivery Date"
            initialValue={
              wazaifPrintingOrderById.deliveryDate
                ? moment(Number(wazaifPrintingOrderById.deliveryDate))
                : null
            }
          />
          <KarkunField
            fieldName="receivedBy"
            fieldLabel="Received By"
            placeholder="Received By"
            initialValue={wazaifPrintingOrderById.refReceivedBy}
          />
          <InputTextAreaField
            fieldName="notes"
            fieldLabel="Notes"
            required={false}
            initialValue={wazaifPrintingOrderById.notes}
          />

          <SelectField
            data={[
              {
                value: 'pending',
                text: 'Pending',
              },
              {
                value: 'completed',
                text: 'Completed',
              },
            ]}
            getDataValue={({ value }) => value}
            getDataText={({ text }) => text}
            allowClear={false}
            initialValue={wazaifPrintingOrderById.status}
            fieldName="status"
            fieldLabel="Status"
          />

          <Divider orientation="left">Ordered Wazaif</Divider>
          <Form.Item name="items" initialValue={wazaifItems} rules={rules} {...formItemExtendedLayout}>
            <ItemsList refForm={this.formRef.current} />
          </Form.Item>

          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <AuditInfo record={wazaifPrintingOrderById} />
      </>
    );
  }
}

export default flowRight(
  WithAllWazaifVendors(),
  graphql(UPDATE_WAZAIF_PRINTING_ORDER, {
    name: 'updateWazaifPrintingOrder',
    options: {
      refetchQueries: [
        'pagedWazaifPrintingOrders',
      ],
    },
  }),
  graphql(WAZAIF_PRINTING_ORDER_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { orderId } = match.params;
      return { variables: { _id: orderId } };
    },
  }),
  WithBreadcrumbs(['Operations', 'Wazaif Management', 'Edit Printing Order'])
)(EditForm);
