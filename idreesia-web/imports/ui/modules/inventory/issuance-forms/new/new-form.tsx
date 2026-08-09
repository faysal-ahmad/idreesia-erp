import React, { useRef, useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { type History } from 'history';
import { type CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import { Divider, Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';
import { useDynamicBreadcrumbs } from 'meteor/idreesia-common/hooks/common';
import { PredefinedFilterNames } from 'meteor/idreesia-common/constants/hr';

import {
  usePhysicalStore,
  usePhysicalStoreLocations,
} from '/imports/ui/modules/inventory/common/hooks';
import {
  DateField,
  FormButtonsSaveCancel,
  InputTextField,
  InputTextAreaField,
  TreeSelectField,
} from '/imports/ui/modules/helpers/fields';
import { KarkunField } from '/imports/ui/modules/hr/karkuns/field';
import { ItemsList } from '../../common/items-list';
import { CREATE_ISSUANCE_FORM } from '../gql';

const FormStyle: CSSProperties = {
  width: '800px',
};

const formItemExtendedLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 20 },
};

type RouteParams = {
  physicalStoreId: string;
};

interface KarkunOption {
  _id: string;
  name: string;
}

export interface NewIssuanceFormValues {
  issueDate: string;
  issuedBy: KarkunOption;
  issuedTo: KarkunOption;
  handedOverTo?: string;
  locationId?: string;
  items?: unknown[];
  notes?: string;
}

interface Props {
  history: History;
}

const NewForm = ({ history }: Props) => {
  const { physicalStoreId } = useParams<RouteParams>();
  const { physicalStore } = usePhysicalStore(physicalStoreId);
  const { locationsByPhysicalStoreId, locationsByPhysicalStoreIdLoading } =
    usePhysicalStoreLocations(physicalStoreId);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const formRef = useRef<{ getFieldsValue(): unknown; resetFields(names: string[]): void }>(null);
  const [createIssuanceForm] = useMutation(CREATE_ISSUANCE_FORM, {
    refetchQueries: [
      'pagedIssuanceForms',
      'issuanceFormsByStockItem',
      'pagedStockItems',
      'issuanceFormsByMonth',
    ],
  });

  useDynamicBreadcrumbs(
    physicalStore
      ? ['Inventory', physicalStore.name, 'Issuance Forms', 'New']
      : ['Inventory', 'Issuance Forms', 'New']
  );

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
  }: NewIssuanceFormValues) => {
    createIssuanceForm({
      variables: {
        issueDate,
        issuedBy: issuedBy._id,
        issuedTo: issuedTo._id,
        handedOverTo,
        physicalStoreId,
        locationId,
        items: items as Parameters<typeof createIssuanceForm>[0]['variables']['items'],
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

  if (locationsByPhysicalStoreIdLoading) {
    return null;
  }

  const rules = [
    {
      required: true,
      message: 'Please add some items.',
    },
  ];

  return (
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
        data={(locationsByPhysicalStoreId ?? []).filter(
          (location) => location != null
        )}
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

      <Divider titlePlacement="left">Issued / Returned Items</Divider>
      <Form.Item name="items" rules={rules} {...formItemExtendedLayout}>
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
  );
};

export default NewForm;
