import React, { Component } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Divider, Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { ItemsList } from '../common/items-list';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
  WithLocationsByPhysicalStore,
} from '/imports/ui/modules/inventory/common/composers';
import {
  DateField,
  InputTextField,
  FormButtonsSaveCancel,
  InputTextAreaField,
  TreeSelectField,
} from '/imports/ui/modules/helpers/fields';

import { PredefinedFilterNames } from 'meteor/idreesia-common/constants/hr';
import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';
import { AuditInfo } from '/imports/ui/modules/common';

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
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    locationsLoading: PropTypes.bool,
    locationsByPhysicalStoreId: PropTypes.array,
    formDataLoading: PropTypes.bool,
    issuanceFormById: PropTypes.object,
    updateIssuanceForm: PropTypes.func,
  };
  
  state = {
    isFieldsTouched: false,
  };

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
      locationsLoading,
      formDataLoading,
      issuanceFormById,
      locationsByPhysicalStoreId,
      physicalStoreId,
    } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (locationsLoading || formDataLoading) {
      return null;
    }

    const rules = [
      {
        required: true,
        message: 'Please add some items.',
      },
    ];

    return (
      <>
        <Form layout="horizontal" style={FormStyle} onFinish={this.handleFinish} onFieldsChange={this.handleFieldsChange}>
          <DateField
            fieldName="issueDate"
            fieldLabel="Issue Date"
            initialValue={moment(Number(issuanceFormById.issueDate))}
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

const formMutation = gql`
  mutation updateIssuanceForm(
    $_id: String!
    $issueDate: String!
    $issuedBy: String!
    $issuedTo: String!
    $handedOverTo: String
    $locationId: String
    $physicalStoreId: String!
    $items: [ItemWithQuantityInput]
    $notes: String
  ) {
    updateIssuanceForm(
      _id: $_id
      issueDate: $issueDate
      issuedBy: $issuedBy
      issuedTo: $issuedTo
      handedOverTo: $handedOverTo
      locationId: $locationId
      physicalStoreId: $physicalStoreId
      items: $items
      notes: $notes
    ) {
      _id
      issueDate
      locationId
      physicalStoreId
      createdAt
      createdBy
      updatedAt
      updatedBy
      items {
        stockItemId
        quantity
        isInflow
      }
      refIssuedBy {
        _id
        name
      }
      refIssuedTo {
        _id
        name
      }
      notes
    }
  }
`;

const formQuery = gql`
  query issuanceFormById($_id: String!) {
    issuanceFormById(_id: $_id) {
      _id
      issueDate
      issuedBy
      issuedTo
      handedOverTo
      locationId
      physicalStoreId
      approvedOn
      createdAt
      createdBy
      updatedAt
      updatedBy
      items {
        stockItemId
        quantity
        isInflow
      }
      refIssuedBy {
        _id
        name
      }
      refIssuedTo {
        _id
        name
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
    name: 'updateIssuanceForm',
    options: {
      refetchQueries: [
        'pagedIssuanceForms',
        'issuanceFormsByStockItem',
        'pagedStockItems',
        'issuanceFormsByMonth',
      ],
    },
  }),
  graphql(formQuery, {
    props: ({ data }) => ({ formDataLoading: data.loading, ...data }),
    options: ({ match }) => {
      const { formId } = match.params;
      return { variables: { _id: formId } };
    },
  }),
  WithDynamicBreadcrumbs(({ physicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Issuance Forms, Edit`;
    }
    return `Inventory, Issuance Forms, Edit`;
  })
)(EditForm);
