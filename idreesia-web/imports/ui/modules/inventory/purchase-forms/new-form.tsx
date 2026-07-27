import React, { Component } from 'react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { withMutation } from '/imports/ui/modules/inventory/common/composers/apollo-hooks';
import { Divider, Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { PredefinedFilterNames } from 'meteor/idreesia-common/constants/hr';

import { ItemsList } from '../common/items-list';
import {
  WithPhysicalStore,
  WithPhysicalStoreId,
  WithVendorsByPhysicalStore,
  WithLocationsByPhysicalStore,
} from '/imports/ui/modules/inventory/common/composers';
import {
  DateField,
  SelectField,
  FormButtonsSaveCancel,
  InputTextAreaField,
  TreeSelectField,
} from '/imports/ui/modules/helpers/fields';

import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';

const AntDivider = Divider as any;
const AntForm = Form as any;
const AntFormItem = Form.Item as any;
const ItemsListComponent = ItemsList as any;
const PurchaseDateField = DateField as any;
const SelectInputField = SelectField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
const TextAreaField = InputTextAreaField as any;
const TreeField = TreeSelectField as any;
const KarkunSelectField = KarkunField as any;

const FormStyle = {
  width: '800px',
};

const formItemExtendedLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 20 },
};

interface PhysicalStore {
  name: string;
}

interface HistoryLike {
  goBack(): void;
}

interface MutateFunction {
  (options: { variables: Record<string, unknown> }): Promise<unknown>;
}

interface SelectOption {
  _id: string;
  name: string;
}

interface PurchaseFormValues {
  purchaseDate: string;
  locationId?: string;
  vendorId?: string;
  receivedBy: { _id: string };
  purchasedBy: { _id: string };
  items?: unknown[];
  notes?: string;
}

interface NewFormProps {
  history: HistoryLike;
  physicalStoreId?: string;
  physicalStore?: PhysicalStore;
  vendorsLoading?: boolean;
  vendorsByPhysicalStoreId?: SelectOption[];
  locationsLoading?: boolean;
  locationsByPhysicalStoreId?: SelectOption[];
  createPurchaseForm: MutateFunction;
}

interface NewFormState {
  isFieldsTouched: boolean;
}

class NewForm extends Component<NewFormProps, NewFormState> {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,

    vendorsLoading: PropTypes.bool,
    vendorsByPhysicalStoreId: PropTypes.array,
    locationsLoading: PropTypes.bool,
    locationsByPhysicalStoreId: PropTypes.array,
    createPurchaseForm: PropTypes.func,
  };

  state = {
    isFieldsTouched: false,
  };

  formRef = React.createRef<any>();

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  };

  handleFinish = ({
    purchaseDate,
    locationId,
    vendorId,
    receivedBy,
    purchasedBy,
    items,
    notes,
  }: PurchaseFormValues) => {
    const { history, physicalStoreId, createPurchaseForm } = this.props;
    createPurchaseForm({
      variables: {
        purchaseDate,
        locationId,
        vendorId,
        receivedBy: receivedBy._id,
        purchasedBy: purchasedBy._id,
        physicalStoreId,
        items,
        notes,
      },
    })
      .then(() => {
        history.goBack();
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  render() {
    const {
      vendorsLoading,
      locationsLoading,
      locationsByPhysicalStoreId,
      vendorsByPhysicalStoreId,
      physicalStoreId,
    } = this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (locationsLoading || vendorsLoading) return null;

    const rules = [
      {
        required: true,
        message: 'Please add some items.',
      },
    ];

    return (
      <AntForm
        ref={this.formRef}
        layout="horizontal"
        style={FormStyle}
        onFinish={this.handleFinish}
        onFieldsChange={this.handleFieldsChange}
      >
        <PurchaseDateField
          fieldName="purchaseDate"
          fieldLabel="Purchase Date"
          required
          requiredMessage="Please input a purchase date."
        />
        <KarkunSelectField
          required
          requiredMessage="Please select a name for Received By / Returned By."
          fieldName="receivedBy"
          fieldLabel="Received By / Returned By"
          placeholder="Received By / Returned By"
          predefinedFilterStoreId={physicalStoreId}
          predefinedFilterName={
            PredefinedFilterNames.PURCHASE_FORMS_RECEIVED_BY_RETURNED_BY
          }
        />
        <KarkunSelectField
          required
          requiredMessage="Please select a name for Purchased By / Returned To."
          fieldName="purchasedBy"
          fieldLabel="Purchased By / Returned To"
          placeholder="Purchased By / Returned To"
          predefinedFilterStoreId={physicalStoreId}
          predefinedFilterName={
            PredefinedFilterNames.PURCHASE_FORMS_PURCHASED_BY_RETURNED_TO
          }
        />

        <SelectInputField
          data={vendorsByPhysicalStoreId ?? []}
          getDataValue={({ _id }: SelectOption) => _id}
          getDataText={({ name }: SelectOption) => name}
          fieldName="vendorId"
          fieldLabel="Vendor"
        />

        <TreeField
          data={locationsByPhysicalStoreId ?? []}
          showSearch
          fieldName="locationId"
          fieldLabel="For Location"
          placeholder="Select a Location"
        />

        <TextAreaField
          fieldName="notes"
          fieldLabel="Notes"
          required={false}
        />

        <AntDivider orientation="left">Purchased / Returned Items</AntDivider>
        <AntFormItem name="items" rules={rules} {...formItemExtendedLayout}>
          <ItemsListComponent
            showPrice
            defaultLabel="Purchased"
            inflowLabel="Purchased"
            outflowLabel="Returned"
            physicalStoreId={physicalStoreId}
            refForm={this.formRef.current}
          />
        </AntFormItem>

        <SaveCancelButtons
          handleCancel={this.handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </AntForm>
    );
  }
}

const formMutation = gql`
  mutation createPurchaseForm(
    $purchaseDate: String!
    $receivedBy: String!
    $purchasedBy: String!
    $physicalStoreId: String!
    $locationId: String
    $vendorId: String
    $items: [ItemWithQuantityAndPriceInput]
    $notes: String
  ) {
    createPurchaseForm(
      purchaseDate: $purchaseDate
      receivedBy: $receivedBy
      purchasedBy: $purchasedBy
      physicalStoreId: $physicalStoreId
      locationId: $locationId
      vendorId: $vendorId
      items: $items
      notes: $notes
    ) {
      _id
      purchaseDate
      physicalStoreId
      locationId
      vendorId
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
      notes
    }
  }
`;

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithVendorsByPhysicalStore(),
  WithLocationsByPhysicalStore(),
  withMutation(formMutation, {
    name: 'createPurchaseForm',
    options: {
      refetchQueries: [
        'pagedPurchaseForms',
        'purchaseFormsByStockItem',
        'pagedStockItems',
        'vendorsByPhysicalStoreId',
        'purchaseFormsByMonth',
      ],
    },
  }),
  WithDynamicBreadcrumbs(({ physicalStore }: { physicalStore?: PhysicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Purchase Forms, New`;
    }
    return `Inventory, Purchase Forms, New`;
  })
)(NewForm as any);
