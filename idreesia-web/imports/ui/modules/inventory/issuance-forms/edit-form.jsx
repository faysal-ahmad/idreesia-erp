import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { flowRight } from 'lodash';

import { Divider, Form, message } from '/imports/ui/controls';
import { ItemsList } from '../common/items-list';
import { WithDynamicBreadcrumbs } from '/imports/ui/composers';
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
import { RecordInfo } from '/imports/ui/modules/helpers/controls';

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
    form: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    locationsLoading: PropTypes.bool,
    locationsByPhysicalStoreId: PropTypes.array,
    formDataLoading: PropTypes.bool,
    issuanceFormById: PropTypes.object,
    updateIssuanceForm: PropTypes.func,
  };

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleSubmit = e => {
    e.preventDefault();
    const {
      form,
      history,
      physicalStoreId,
      updateIssuanceForm,
      issuanceFormById: { _id },
    } = this.props;
    form.validateFields(
      (
        err,
        {
          issueDate,
          issuedBy,
          issuedTo,
          handedOverTo,
          locationId,
          items,
          notes,
        }
      ) => {
        if (err) return;

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
      }
    );
  };

  getItemsField() {
    const { form, physicalStoreId, issuanceFormById } = this.props;
    const { getFieldDecorator } = form;

    const rules = [
      {
        required: true,
        message: 'Please add some items.',
      },
    ];
    return getFieldDecorator('items', {
      rules,
      initialValue: issuanceFormById.items,
    })(
      <ItemsList
        refForm={form}
        defaultLabel="Issued"
        inflowLabel="Returned"
        outflowLabel="Issued"
        physicalStoreId={physicalStoreId}
      />
    );
  }

  render() {
    const {
      locationsLoading,
      formDataLoading,
      issuanceFormById,
      locationsByPhysicalStoreId,
    } = this.props;
    if (locationsLoading || formDataLoading) {
      return null;
    }

    const { getFieldDecorator } = this.props.form;

    return (
      <Fragment>
        <Form
          layout="horizontal"
          style={FormStyle}
          onSubmit={this.handleSubmit}
        >
          <DateField
            fieldName="issueDate"
            fieldLabel="Issue Date"
            initialValue={moment(Number(issuanceFormById.issueDate))}
            required
            requiredMessage="Please input an issue date."
            getFieldDecorator={getFieldDecorator}
          />
          <KarkunField
            required
            requiredMessage="Please select a name for Issued By / Received By."
            fieldName="issuedBy"
            fieldLabel="Issued By / Received By"
            placeholder="Issued By / Received By"
            initialValue={issuanceFormById.refIssuedBy}
            getFieldDecorator={getFieldDecorator}
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
            getFieldDecorator={getFieldDecorator}
            predefinedFilterName={
              PredefinedFilterNames.ISSUANCE_FORMS_ISSUED_TO_RETURNED_BY
            }
          />
          <InputTextField
            fieldName="handedOverTo"
            fieldLabel="Handed Over To / By"
            required={false}
            initialValue={issuanceFormById.handedOverTo}
            getFieldDecorator={getFieldDecorator}
          />
          <TreeSelectField
            data={locationsByPhysicalStoreId}
            showSearch
            fieldName="locationId"
            fieldLabel="For Location"
            placeholder="Select a Location"
            initialValue={issuanceFormById.locationId}
            getFieldDecorator={getFieldDecorator}
          />

          <InputTextAreaField
            fieldName="notes"
            fieldLabel="Notes"
            required={false}
            initialValue={issuanceFormById.notes}
            getFieldDecorator={getFieldDecorator}
          />

          <Divider orientation="left">Issued / Returned Items</Divider>
          <Form.Item {...formItemExtendedLayout}>
            {this.getItemsField()}
          </Form.Item>

          <FormButtonsSaveCancel handleCancel={this.handleCancel} />
        </Form>
        <RecordInfo record={issuanceFormById} />
      </Fragment>
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
  Form.create(),
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
