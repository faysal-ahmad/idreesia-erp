import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withMutation } from '/imports/ui/modules/inventory/common/composers/apollo-hooks';
import dayjs from 'dayjs';
import { Divider, Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { PredefinedFilterNames } from 'meteor/idreesia-common/constants/hr';
import {
  DateField,
  SelectField,
  FormButtonsSaveCancel,
  InputTextAreaField,
  TreeSelectField,
} from '/imports/ui/modules/helpers/fields';
import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';
import { AuditInfo } from '/imports/ui/modules/common';
import { ItemsList } from '../../common/items-list';
import { UPDATE_PURCHASE_FORM } from '../gql';

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
const AuditInfoComponent = AuditInfo as any;

const FormStyle = {
  width: '900px',
};

const formItemExtendedLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 20 },
};

interface HistoryLike {
  goBack(): void;
}

interface SelectOption {
  _id: string;
  name: string;
}

interface PurchaseItem {
  stockItemId: string;
  quantity: number;
  isInflow: boolean;
  price?: number;
}

interface PurchaseForm {
  _id: string;
  purchaseDate: string;
  physicalStoreId: string;
  locationId?: string;
  vendorId?: string;
  refReceivedBy?: SelectOption;
  refPurchasedBy?: SelectOption;
  items: PurchaseItem[];
  notes?: string;
}

interface MutateFunction {
  (options: { variables: Record<string, unknown> }): Promise<unknown>;
}

interface PurchaseDetailsProps {
  history: HistoryLike;
  physicalStoreId?: string;
  locationsByPhysicalStoreId?: SelectOption[];
  purchaseFormById: PurchaseForm;
  vendorsByPhysicalStoreId?: SelectOption[];
  updatePurchaseForm: MutateFunction;
}

interface PurchaseDetailsState {
  isFieldsTouched: boolean;
}

interface PurchaseFormValues {
  purchaseDate: string;
  locationId?: string;
  vendorId?: string;
  receivedBy: SelectOption;
  purchasedBy: SelectOption;
  items: PurchaseItem[];
  notes?: string;
}

class PurchaseDetails extends Component<
  PurchaseDetailsProps,
  PurchaseDetailsState
> {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    physicalStoreId: PropTypes.string,
    physicalStore: PropTypes.object,
    locationsByPhysicalStoreId: PropTypes.array,
    purchaseFormById: PropTypes.object,
    vendorsByPhysicalStoreId: PropTypes.array,

    updatePurchaseForm: PropTypes.func,
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
    const {
      history,
      physicalStoreId,
      updatePurchaseForm,
      purchaseFormById: { _id },
    } = this.props;

    const updatedItems = items.map(
      ({ stockItemId, quantity, isInflow, price }: PurchaseItem) => ({
        stockItemId,
        quantity,
        isInflow,
        price,
      })
    );

    updatePurchaseForm({
      variables: {
        _id,
        physicalStoreId,
        purchaseDate,
        locationId,
        vendorId,
        receivedBy: receivedBy._id,
        purchasedBy: purchasedBy._id,
        items: updatedItems,
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
      purchaseFormById,
      vendorsByPhysicalStoreId,
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
            initialValue={dayjs(Number(purchaseFormById.purchaseDate))}
            required
            requiredMessage="Please input a purchase date."
          />
          <KarkunSelectField
            required
            requiredMessage="Please select a name for Received By / Returned By."
            fieldName="receivedBy"
            fieldLabel="Received By / Returned By"
            placeholder="Received By / Returned By"
            initialValue={purchaseFormById.refReceivedBy}
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
            initialValue={purchaseFormById.refPurchasedBy}
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
            initialValue={purchaseFormById.vendorId}
          />

          <TreeField
            data={locationsByPhysicalStoreId ?? []}
            showSearch
            fieldName="locationId"
            fieldLabel="For Location"
            placeholder="Select a Location"
            initialValue={purchaseFormById.locationId}
          />

          <TextAreaField
            fieldName="notes"
            fieldLabel="Notes"
            required={false}
            initialValue={purchaseFormById.notes}
          />

          <AntDivider orientation="left">Purchased / Returned Items</AntDivider>
          <AntFormItem
            name="items"
            initialValue={purchaseFormById.items}
            rules={rules}
            {...formItemExtendedLayout}
          >
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
        <AuditInfoComponent record={purchaseFormById} />
      </>
    );
  }
}

export default flowRight(
  withMutation(UPDATE_PURCHASE_FORM, {
    name: 'updatePurchaseForm',
    options: {
      refetchQueries: [
        'pagedPurchaseForms',
        'purchaseFormsByStockItem',
        'pagedStockItems',
        'vendorsByPhysicalStoreId',
        'purchaseFormsByMonth',
      ],
    },
  })
)(PurchaseDetails as any);
