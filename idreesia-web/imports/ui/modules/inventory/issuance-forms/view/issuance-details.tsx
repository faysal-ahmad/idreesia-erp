import React from 'react';
import dayjs from 'dayjs';
import { type History } from 'history';
import { type CSSProperties } from 'react';
import { Divider, Form } from 'antd';
import type { IssuanceFormByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { noop } from 'meteor/idreesia-common/utilities/lodash';

import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';
import {
  InputTextField,
  DateField,
  FormButtonsClose,
  InputTextAreaField,
} from '/imports/ui/modules/helpers/fields';
import { ItemsList } from '../../common/items-list';

const FormStyle: CSSProperties = {
  width: '800px',
};

const formItemExtendedLayout = {
  labelCol: { span: 0 },
  wrapperCol: { span: 20 },
};

type IssuanceForm = NonNullable<IssuanceFormByIdQuery['issuanceFormById']>;

interface Props {
  history: History;
  physicalStoreId: string;
  issuanceFormById: IssuanceForm;
}

export const IssuanceDetails = ({
  history,
  physicalStoreId,
  issuanceFormById,
}: Props) => {
  const handleClose = () => {
    history.goBack();
  };

  const rules = [
    {
      required: true,
      message: 'Please add some items.',
    },
  ];

  return (
    <>
      <Form layout="horizontal" style={FormStyle} onFinish={noop}>
        <DateField
          fieldName="issueDate"
          fieldLabel="Issue Date"
          initialValue={dayjs(Number(issuanceFormById.issueDate))}
          required
          requiredMessage="Please input an issue date."
        />
        <InputTextField
          fieldName="issuedBy"
          fieldLabel="Issued By"
          initialValue={issuanceFormById.refIssuedBy?.name ?? ''}
          required
          requiredMessage="Please input a name in issued by."
        />
        <InputTextField
          fieldName="issuedTo"
          fieldLabel="Issued To"
          initialValue={issuanceFormById.refIssuedTo?.name ?? ''}
          required
          requiredMessage="Please input a name in issued to."
        />
        <InputTextField
          fieldName="handedOverTo"
          fieldLabel="Handed Over To / By"
          initialValue={issuanceFormById.handedOverTo ?? undefined}
        />
        <InputTextField
          fieldName="locationId"
          fieldLabel="For Location"
          initialValue={issuanceFormById.refLocation?.name ?? undefined}
        />
        <InputTextAreaField
          fieldName="notes"
          fieldLabel="Notes"
          required={false}
          initialValue={issuanceFormById.notes ?? undefined}
        />

        <Divider orientation="left">Issued / Returned Items</Divider>
        <Form.Item
          name="items"
          initialValue={issuanceFormById.items ?? []}
          rules={rules}
          {...formItemExtendedLayout}
        >
          <ItemsList
            readOnly
            defaultLabel="Issued"
            inflowLabel="Returned"
            outflowLabel="Issued"
            physicalStoreId={physicalStoreId}
          />
        </Form.Item>

        <FormButtonsClose handleClose={handleClose} />
      </Form>
      <AuditInfo record={issuanceFormById} />
    </>
  );
};
