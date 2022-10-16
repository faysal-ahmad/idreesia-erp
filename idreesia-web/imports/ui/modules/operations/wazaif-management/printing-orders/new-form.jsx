import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';
import { ItemsList } from '../common/items-list';
import { CREATE_WAZAIF_PRINTING_ORDER } from './gql';

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
    allWazaifVendors: PropTypes.array,
    allWazaifVendorsLoading: PropTypes.bool,
    createWazaifPrintingOrder: PropTypes.func,
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
    const { history, createWazaifPrintingOrder } = this.props;
    createWazaifPrintingOrder({
      variables: {
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
    } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (allWazaifVendorsLoading) return null;

    const rules = [
      {
        required: true,
        message: 'Please add some items.',
      },
    ];

    return (
      <Form ref={this.formRef} layout="horizontal" style={FormStyle} onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <DateField
          fieldName="orderDate"
          fieldLabel="Ordered Date"
          required
          requiredMessage="Please input a value for ordered date."
        />
        <SelectField
          data={allWazaifVendors}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
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
        />
        <DateField
          fieldName="deliveryDate"
          fieldLabel="Delivery Date"
          initialValue={null}
        />
        <KarkunField
          fieldName="receivedBy"
          fieldLabel="Received By"
          placeholder="Received By"
        />

        <InputTextAreaField
          fieldName="notes"
          fieldLabel="Notes"
          required={false}
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
          initialValue="pending"
          fieldName="status"
          fieldLabel="Status"
        />

        <Divider orientation="left">Ordered Wazaif</Divider>
        <Form.Item name="items" rules={rules} {...formItemExtendedLayout}>
          <ItemsList refForm={this.formRef.current} />
        </Form.Item>

        <FormButtonsSaveCancel
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
    );
  }
}

export default flowRight(
  WithAllWazaifVendors(),
  graphql(CREATE_WAZAIF_PRINTING_ORDER, {
    name: 'createWazaifPrintingOrder',
    options: {
      refetchQueries: [
        'pagedWazaifPrintingOrders',
      ],
    },
  }),
  WithBreadcrumbs(['Operations', 'Wazaif Management', 'New Printing Order'])
)(NewForm);
