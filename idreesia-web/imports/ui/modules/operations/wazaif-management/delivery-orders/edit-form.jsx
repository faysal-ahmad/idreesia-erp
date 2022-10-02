import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { graphql } from 'react-apollo';
import { Divider, Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import {
  WithAllCities,
  WithAllCityMehfils,
} from '/imports/ui/modules/outstation/common/composers';
import {
  CascaderField,
  DateField,
  FormButtonsSaveCancel,
  InputTextAreaField,
  SelectField,
} from '/imports/ui/modules/helpers/fields';
import { getCityMehfilCascaderData } from '/imports/ui/modules/common/utilities';
import { AuditInfo } from '/imports/ui/modules/common';
import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';

import { ItemsList } from '../common/items-list';
import { WAZAIF_DELIVERY_ORDER_BY_ID, UPDATE_WAZAIF_DELIVERY_ORDER } from './gql';

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
    allCities: PropTypes.array,
    allCitiesLoading: PropTypes.bool,
    allCityMehfils: PropTypes.array,
    allCityMehfilsLoading: PropTypes.bool,
    formDataLoading: PropTypes.bool,
    updateWazaifDeliveryOrder: PropTypes.func,
    wazaifDeliveryOrderById: PropTypes.object,
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
    cityIdMehfilId,
    requestedDate,
    requestedBy,
    deliveryDate,
    deliveredTo,
    items,
    notes,
    status,
  }) => {
    const {
      history,
      updateWazaifDeliveryOrder,
      wazaifDeliveryOrderById: { _id },
    } = this.props;

    updateWazaifDeliveryOrder({
      variables: {
        _id,
        cityId: cityIdMehfilId[0],
        cityMehfilId: cityIdMehfilId[1],
        requestedDate,
        requestedBy: requestedBy._id,
        deliveryDate,
        deliveredTo: deliveredTo?._id,
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
      allCitiesLoading,
      allCities,
      allCityMehfilsLoading,
      allCityMehfils,
      formDataLoading,
      wazaifDeliveryOrderById,
    } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (formDataLoading || allCitiesLoading || allCityMehfilsLoading) return null;

    const rules = [
      {
        required: true,
        message: 'Please add some items.',
      },
    ];

    const wazaifItems = wazaifDeliveryOrderById.items.map(item => ({
      wazeefaId: item.wazeefaId,
      formattedName: item.formattedName,
      packets: item.packets,
      wazaifCount: item.wazaifCount,
    }));

    return (
      <>
        <Form ref={this.formRef} layout="horizontal" style={FormStyle} onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
          <DateField
            fieldName="requestedDate"
            fieldLabel="Requested Date"
            initialValue={moment(Number(wazaifDeliveryOrderById.requestedDate))}
            required
            requiredMessage="Please input a value for requested date."
          />
          <CascaderField
            data={getCityMehfilCascaderData(allCities, allCityMehfils)}
            fieldName="cityIdMehfilId"
            fieldLabel="For City/Mehfil"
            initialValue={[wazaifDeliveryOrderById.cityId, wazaifDeliveryOrderById.cityMehfilId]}
            required
            requiredMessage="Please select a city/mehfil from the list."
          />
          <KarkunField
            required
            requiredMessage="Please select a karkun name for Requested By."
            fieldName="requestedBy"
            fieldLabel="Requested By"
            placeholder="Requested By"
            initialValue={wazaifDeliveryOrderById.refRequestedBy}
          />
          <KarkunField
            fieldName="deliveredTo"
            fieldLabel="Delivered To"
            placeholder="Delivered To"
            initialValue={wazaifDeliveryOrderById.refDeliveredTo}
          />
          <InputTextAreaField
            fieldName="notes"
            fieldLabel="Notes"
            required={false}
            initialValue={wazaifDeliveryOrderById.notes}
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
            initialValue={wazaifDeliveryOrderById.status}
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
        <AuditInfo record={wazaifDeliveryOrderById} />
      </>
    );
  }
}

export default flowRight(
  WithAllCities(),
  WithAllCityMehfils(),
  graphql(UPDATE_WAZAIF_DELIVERY_ORDER, {
    name: 'updateWazaifDeliveryOrder',
    options: {
      refetchQueries: [
        'pagedWazaifDeliveryOrders',
      ],
    },
  }),
  graphql(WAZAIF_DELIVERY_ORDER_BY_ID, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { orderId } = match.params;
      return { variables: { _id: orderId } };
    },
  }),
  WithBreadcrumbs(['Operations', 'Wazaif Management', 'Edit Delivery Order'])
)(EditForm);
