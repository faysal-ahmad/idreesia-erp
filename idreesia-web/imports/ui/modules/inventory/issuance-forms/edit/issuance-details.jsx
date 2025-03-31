import React, { Component } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { graphql } from 'react-apollo';
import { Divider, Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { PredefinedFilterNames } from 'meteor/idreesia-common/constants/hr';
import {
  DateField,
  InputTextField,
  FormButtonsSaveCancel,
  InputTextAreaField,
  TreeSelectField,
} from '/imports/ui/modules/helpers/fields';
import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';
import { AuditInfo } from '/imports/ui/modules/common';
import { UPDATE_ISSUANCE_FORM } from '../gql';
import { ItemsList } from '../../common/items-list';

const FormStyle = {
  width: '800px',
};

const formItemExtendedLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 20 },
};

class IssuanceDetails extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,
    locationsByPhysicalStoreId: PropTypes.array,
    issuanceFormById: PropTypes.object,

    updateIssuanceForm: PropTypes.func,
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
    issueDate,
    issuedBy,
    issuedTo,
    handedOverTo,
    locationId,
    items,
    notes,
  }) => {
    const {
      history,
      physicalStoreId,
      updateIssuanceForm,
      issuanceFormById: { _id },
    } = this.props;
    const updatedItems = items.map(
      ({ stockItemId, quantity, isInflow }) => ({
        stockItemId,
        quantity,
        isInflow,
      })
    );
    updateIssuanceForm({
      variables: {
        _id,
        issueDate,
        issuedBy: issuedBy._id,
        issuedTo: issuedTo._id,
        handedOverTo,
        locationId,
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
  };

  render() {
    const {
      issuanceFormById,
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
            fieldName="issueDate"
            fieldLabel="Issue Date"
            initialValue={dayjs(Number(issuanceFormById.issueDate))}
            required
            requiredMessage="Please input an issue date."
          />
          <KarkunField
            required
            requiredMessage="Please select a name for Issued By / Received By."
            fieldName="issuedBy"
            fieldLabel="Issued By / Received By"
            placeholder="Issued By / Received By"
            initialValue={issuanceFormById.refIssuedBy}
            predefinedFilterStoreId={physicalStoreId}
            predefinedFilterName={
              PredefinedFilterNames.ISSUANCE_FORMS_ISSUED_BY_RECEIVED_BY
            }
          />
          <KarkunField
            required
            requiredMessage="Please select a name for Issued To / Returned By."
            fieldName="issuedTo"
            fieldLabel="Issued To / Returned By"
            placeholder="Issued To / Returned By"
            initialValue={issuanceFormById.refIssuedTo}
            predefinedFilterStoreId={physicalStoreId}
            predefinedFilterName={
              PredefinedFilterNames.ISSUANCE_FORMS_ISSUED_TO_RETURNED_BY
            }
          />
          <InputTextField
            fieldName="handedOverTo"
            fieldLabel="Handed Over To / By"
            required={false}
            initialValue={issuanceFormById.handedOverTo}
          />
          <TreeSelectField
            data={locationsByPhysicalStoreId}
            showSearch
            fieldName="locationId"
            fieldLabel="For Location"
            placeholder="Select a Location"
            initialValue={issuanceFormById.locationId}
          />

          <InputTextAreaField
            fieldName="notes"
            fieldLabel="Notes"
            required={false}
            initialValue={issuanceFormById.notes}
          />

          <Divider orientation="left">Issued / Returned Items</Divider>
          <Form.Item name="items" initialValue={issuanceFormById.items} rules={rules} {...formItemExtendedLayout}>
            <ItemsList
              defaultLabel="Issued"
              inflowLabel="Returned"
              outflowLabel="Issued"
              physicalStoreId={physicalStoreId}
              refForm={this.formRef.current}
            />
          </Form.Item>

          <FormButtonsSaveCancel
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </Form>
        <AuditInfo record={issuanceFormById} />
      </>
    );
  }
}

export default flowRight(
  graphql(UPDATE_ISSUANCE_FORM, {
    name: 'updateIssuanceForm',
    options: {
      refetchQueries: [
        'pagedIssuanceForms',
        'issuanceFormsByStockItem',
        'pagedStockItems',
        'issuanceFormsByMonth',
      ],
    },
  })
)(IssuanceDetails);
