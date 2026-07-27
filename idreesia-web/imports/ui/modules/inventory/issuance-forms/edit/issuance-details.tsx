import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withMutation } from '/imports/ui/modules/inventory/common/composers/apollo-hooks';
import dayjs from 'dayjs';
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

const AntDivider = Divider as any;
const AntForm = Form as any;
const AntFormItem = Form.Item as any;
const IssueDateField = DateField as any;
const TextField = InputTextField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
const TextAreaField = InputTextAreaField as any;
const TreeField = TreeSelectField as any;
const KarkunSelectField = KarkunField as any;
const AuditInfoComponent = AuditInfo as any;
const ItemsListComponent = ItemsList as any;

const FormStyle = {
  width: '800px',
};

const formItemExtendedLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 20 },
};

interface HistoryLike { goBack(): void; }
interface SelectOption { _id: string; name: string; }
interface IssuanceItem { stockItemId: string; quantity: number; isInflow: boolean; }
interface IssuanceForm {
  _id: string;
  issueDate: string;
  locationId?: string;
  refIssuedBy?: SelectOption;
  refIssuedTo?: SelectOption;
  handedOverTo?: string;
  items: IssuanceItem[];
  notes?: string;
}
interface MutateFunction { (options: { variables: Record<string, unknown> }): Promise<unknown>; }
interface IssuanceDetailsProps {
  history: HistoryLike;
  physicalStoreId?: string;
  locationsByPhysicalStoreId?: SelectOption[];
  issuanceFormById: IssuanceForm;
  updateIssuanceForm: MutateFunction;
}
interface IssuanceDetailsState { isFieldsTouched: boolean; }
interface IssuanceFormValues {
  issueDate: string;
  issuedBy: SelectOption;
  issuedTo: SelectOption;
  handedOverTo?: string;
  locationId?: string;
  items: IssuanceItem[];
  notes?: string;
}

class IssuanceDetails extends Component<IssuanceDetailsProps, IssuanceDetailsState> {
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

  formRef = React.createRef<any>();

  handleCancel = () => {
    const { history } = this.props;
    history.goBack();
  };

  handleFieldsChange = () => {
    this.setState({ isFieldsTouched: true });
  };

  handleFinish = ({
    issueDate,
    issuedBy,
    issuedTo,
    handedOverTo,
    locationId,
    items,
    notes,
  }: IssuanceFormValues) => {
    const {
      history,
      physicalStoreId,
      updateIssuanceForm,
      issuanceFormById: { _id },
    } = this.props;
    const updatedItems = items.map(({ stockItemId, quantity, isInflow }: IssuanceItem) => ({
      stockItemId,
      quantity,
      isInflow,
    }));
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
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { issuanceFormById, locationsByPhysicalStoreId, physicalStoreId } =
      this.props;
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
          <IssueDateField
            fieldName="issueDate"
            fieldLabel="Issue Date"
            initialValue={dayjs(Number(issuanceFormById.issueDate))}
            required
            requiredMessage="Please input an issue date."
          />
          <KarkunSelectField
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
          <KarkunSelectField
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
          <TextField
            fieldName="handedOverTo"
            fieldLabel="Handed Over To / By"
            required={false}
            initialValue={issuanceFormById.handedOverTo}
          />
          <TreeField
            data={locationsByPhysicalStoreId ?? []}
            showSearch
            fieldName="locationId"
            fieldLabel="For Location"
            placeholder="Select a Location"
            initialValue={issuanceFormById.locationId}
          />

          <TextAreaField
            fieldName="notes"
            fieldLabel="Notes"
            required={false}
            initialValue={issuanceFormById.notes}
          />

          <AntDivider orientation="left">Issued / Returned Items</AntDivider>
          <AntFormItem
            name="items"
            initialValue={issuanceFormById.items}
            rules={rules}
            {...formItemExtendedLayout}
          >
            <ItemsListComponent
              defaultLabel="Issued"
              inflowLabel="Returned"
              outflowLabel="Issued"
              physicalStoreId={physicalStoreId}
              refForm={this.formRef.current}
            />
          </AntFormItem>

          <SaveCancelButtons
            handleCancel={this.handleCancel}
            isFieldsTouched={isFieldsTouched}
          />
        </AntForm>
        <AuditInfoComponent record={issuanceFormById} />
      </>
    );
  }
}

export default flowRight(
  withMutation(UPDATE_ISSUANCE_FORM, {
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
)(IssuanceDetails as any);
