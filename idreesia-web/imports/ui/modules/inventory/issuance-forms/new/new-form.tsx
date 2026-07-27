import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withMutation } from '/imports/ui/modules/inventory/common/composers/apollo-hooks';
import { Divider, Form, message } from 'antd';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import { WithDynamicBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { PredefinedFilterNames } from 'meteor/idreesia-common/constants/hr';
import { ItemsList } from '../../common/items-list';
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

import { CREATE_ISSUANCE_FORM } from '../gql';

const AntDivider = Divider as any;
const AntForm = Form as any;
const AntFormItem = Form.Item as any;
const ItemsListComponent = ItemsList as any;
const IssueDateField = DateField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
const TextField = InputTextField as any;
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

interface PhysicalStore { name: string; }
interface HistoryLike { goBack(): void; }
interface SelectOption { _id: string; name: string; }
interface MutateFunction { (options: { variables: Record<string, unknown> }): Promise<unknown>; }
interface IssuanceFormValues {
  issueDate: string;
  issuedBy: SelectOption;
  issuedTo: SelectOption;
  handedOverTo?: string;
  locationId?: string;
  items?: unknown[];
  notes?: string;
}
interface NewFormProps {
  history: HistoryLike;
  physicalStoreId?: string;
  physicalStore?: PhysicalStore;
  locationsLoading?: boolean;
  locationsByPhysicalStoreId?: SelectOption[];
  createIssuanceForm: MutateFunction;
}
interface NewFormState { isFieldsTouched: boolean; }

class NewForm extends Component<NewFormProps, NewFormState> {
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
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  render() {
    const { physicalStoreId, locationsLoading, locationsByPhysicalStoreId } =
      this.props;
    const isFieldsTouched = this.state.isFieldsTouched;
    if (locationsLoading) return null;

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
        <IssueDateField
          fieldName="issueDate"
          fieldLabel="Issue Date"
          required
          requiredMessage="Please input an issue date."
        />
        <KarkunSelectField
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
        <KarkunSelectField
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

        <TextField
          fieldName="handedOverTo"
          fieldLabel="Handed Over To / By"
          required={false}
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

        <AntDivider orientation="left">Issued / Returned Items</AntDivider>
        <AntFormItem name="items" rules={rules} {...formItemExtendedLayout}>
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
    );
  }
}

export default flowRight(
  WithPhysicalStoreId(),
  WithPhysicalStore(),
  WithLocationsByPhysicalStore(),
  withMutation(CREATE_ISSUANCE_FORM, {
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
  WithDynamicBreadcrumbs(({ physicalStore }: { physicalStore?: PhysicalStore }) => {
    if (physicalStore) {
      return `Inventory, ${physicalStore.name}, Issuance Forms, New`;
    }
    return `Inventory, Issuance Forms, New`;
  })
)(NewForm as any);
