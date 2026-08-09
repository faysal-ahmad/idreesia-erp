import React, { useRef, useState } from 'react';
import { useMutation } from '@apollo/client/react';
import dayjs from 'dayjs';
import { type History } from 'history';
import { type CSSProperties } from 'react';
import { Divider, Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import type { IssuanceFormByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { PredefinedFilterNames } from 'meteor/idreesia-common/constants/hr';

import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';
import {
  DateField,
  InputTextField,
  FormButtonsSaveCancel,
  InputTextAreaField,
  TreeSelectField,
} from '/imports/ui/modules/helpers/fields';
import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';
import { UPDATE_ISSUANCE_FORM } from '../gql';
import { ItemsList } from '../../common/items-list';
import type { usePhysicalStoreLocations } from '/imports/ui/modules/stores/common/hooks';

type IssuanceForm = NonNullable<IssuanceFormByIdQuery['issuanceFormById']>;
type LocationRecord = NonNullable<
  ReturnType<typeof usePhysicalStoreLocations>['locationsByPhysicalStoreId']
>[number];

const FormStyle: CSSProperties = {
  width: '800px',
};

const formItemExtendedLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 20 },
};

interface KarkunOption {
  _id: string;
  name: string;
}

interface IssuanceItem {
  stockItemId: string;
  quantity: number;
  isInflow: boolean;
}

export interface IssuanceDetailsFormValues {
  issueDate: string;
  issuedBy: KarkunOption;
  issuedTo: KarkunOption;
  handedOverTo?: string;
  locationId?: string;
  items: IssuanceItem[];
  notes?: string;
}

interface Props {
  history: History;
  physicalStoreId: string;
  locationsByPhysicalStoreId: LocationRecord[];
  issuanceFormById: IssuanceForm;
}

const IssuanceDetails = ({
  history,
  physicalStoreId,
  locationsByPhysicalStoreId,
  issuanceFormById,
}: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const formRef = useRef<{ getFieldsValue(): unknown; resetFields(names: string[]): void }>(null);
  const [updateIssuanceForm] = useMutation(UPDATE_ISSUANCE_FORM, {
    refetchQueries: [
      'pagedIssuanceForms',
      'issuanceFormsByStockItem',
      'pagedStockItems',
      'issuanceFormsByMonth',
    ],
  });

  const handleCancel = () => {
    history.goBack();
  };

  const handleFinish = ({
    issueDate,
    issuedBy,
    issuedTo,
    handedOverTo,
    locationId,
    items,
    notes,
  }: IssuanceDetailsFormValues) => {
    const updatedItems = items.map(({ stockItemId, quantity, isInflow }) => ({
      stockItemId,
      quantity,
      isInflow,
    }));
    updateIssuanceForm({
      variables: {
        _id: issuanceFormById._id as string,
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

  const rules = [
    {
      required: true,
      message: 'Please add some items.',
    },
  ];

  return (
    <>
      <Form
        ref={formRef as React.RefObject<never>}
        layout="horizontal"
        style={FormStyle}
        onFinish={handleFinish}
        onFieldsChange={() => setIsFieldsTouched(true)}
      >
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
          initialValue={issuanceFormById.refIssuedBy ?? undefined}
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
          initialValue={issuanceFormById.refIssuedTo ?? undefined}
          predefinedFilterStoreId={physicalStoreId}
          predefinedFilterName={
            PredefinedFilterNames.ISSUANCE_FORMS_ISSUED_TO_RETURNED_BY
          }
        />
        <InputTextField
          fieldName="handedOverTo"
          fieldLabel="Handed Over To / By"
          required={false}
          initialValue={issuanceFormById.handedOverTo ?? undefined}
        />
        <TreeSelectField
          data={(locationsByPhysicalStoreId ?? []).filter(
            (location) => location != null
          )}
          showSearch
          fieldName="locationId"
          fieldLabel="For Location"
          placeholder="Select a Location"
          initialValue={issuanceFormById.locationId ?? undefined}
        />

        <InputTextAreaField
          fieldName="notes"
          fieldLabel="Notes"
          required={false}
          initialValue={issuanceFormById.notes ?? undefined}
        />

        <Divider titlePlacement="left">Issued / Returned Items</Divider>
        <Form.Item
          name="items"
          initialValue={issuanceFormById.items ?? []}
          rules={rules}
          {...formItemExtendedLayout}
        >
          <ItemsList
            defaultLabel="Issued"
            inflowLabel="Returned"
            outflowLabel="Issued"
            physicalStoreId={physicalStoreId}
            refForm={formRef.current as never}
          />
        </Form.Item>

        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={issuanceFormById} />
    </>
  );
};

export default IssuanceDetails;
