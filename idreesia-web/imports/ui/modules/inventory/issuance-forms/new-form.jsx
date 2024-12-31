import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Divider, Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { PredefinedFilterNames } from 'meteor/idreesia-common/constants/hr';
import { ItemsList } from '../common/items-list';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
  WithLocationsByPhysicalStore,
} from '/imports/ui/modules/inventory/common/composers';
import {
  DateField,
  FormButtonsSaveCancel,
  InputTextField,
  InputTextAreaField,
  TreeSelectField,
} from '/imports/ui/modules/helpers/fields';

import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';

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
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    locationsLoading: PropTypes.bool,
    locationsByPhysicalStoreId: PropTypes.array,
    createIssuanceForm: PropTypes.func,
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
    const { history, physicalStoreId, createIssuanceForm } = this.props;
    createIssuanceForm({
      variables: {
        issueDate,
        issuedBy: issuedBy._id,
        issuedTo: issuedTo._id,
        handedOverTo,
        physicalStoreId,
        locationId,
        items,
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
    const { physicalStoreId, locationsLoading, locationsByPhysicalStoreId } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (locationsLoading) return null;

    const rules = [
      {
        required: true,
        message: 'Please add some items.',
      },
    ];

    return (
      <Form ref={this.formRef} layout="horizontal" style={FormStyle} onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
        <DateField
          fieldName="issueDate"
          fieldLabel="Issue Date"
          required
          requiredMessage="Please input an issue date."
        />
        <KarkunField
          required
          requiredMessage="Please select a name for Issued By / Received By."
          fieldName="issuedBy"
          fieldLabel="Issued By / Received By"
          placeholder="Issued By / Received By"
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
          predefinedFilterStoreId={physicalStoreId}
          predefinedFilterName={
            PredefinedFilterNames.ISSUANCE_FORMS_ISSUED_TO_RETURNED_BY
          }
        />

        <InputTextField
          fieldName="handedOverTo"
          fieldLabel="Handed Over To / By"
          required={false}
        />

        <TreeSelectField
          data={locationsByPhysicalStoreId}
          showSearch
          fieldName="locationId"
          fieldLabel="For Location"
          placeholder="Select a Location"
        />

        <InputTextAreaField
          fieldName="notes"
          fieldLabel="Notes"
          required={false}
        />

        <Divider orientation="left">Issued / Returned Items</Divider>
        <Form.Item name="items" rules={rules} {...formItemExtendedLayout}>
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
    );
  }
}

const formMutation = gql`
  mutation createIssuanceForm(
    $issueDate: String!
    $issuedBy: String!
    $issuedTo: String!
    $handedOverTo: String
    $physicalStoreId: String!
    $locationId: String
    $items: [ItemWithQuantityInput]
    $notes: String
  ) {
    createIssuanceForm(
      issueDate: $issueDate
      issuedBy: $issuedBy
      issuedTo: $issuedTo
      handedOverTo: $handedOverTo
      physicalStoreId: $physicalStoreId
      locationId: $locationId
      items: $items
      notes: $notes
    ) {
      _id
      issueDate
      physicalStoreId
      locationId
      items {
        stockItemId
        quantity
        isInflow
      }
      notes
    }
  }
`;

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithLocationsByPhysicalStore(),
  graphql(formMutation, {
    name: 'createIssuanceForm',
    options: {
      refetchQueries: [
        'pagedIssuanceForms',
        'issuanceFormsByStockItem',
        'pagedStockItems',
        'issuanceFormsByMonth',
      ],
    },
  }),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Issuance Forms, New`;
    }
    return `Inventory, Issuance Forms, New`;
  })
)(NewForm);
