import React, { useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { Form } from 'antd';

import {
  DateField,
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import AuditInfo from '/imports/ui/modules/common/audit-info/audit-info';
import type { HrKarkunByIdForKarkunsQuery } from 'meteor/idreesia-common/types/client-operations';

type KarkunRecord = Partial<NonNullable<HrKarkunByIdForKarkunsQuery['hrKarkunById']>> & {
  msLastVisitDate?: string | null;
};

export interface KarkunWazaifFormValues {
  lastTarteebDate?: Dayjs | null;
  mehfilRaabta?: string;
  msRaabta?: string;
  msLastVisitDate?: Dayjs | null;
}

interface Props {
  karkun: KarkunRecord;
  handleFinish(values: KarkunWazaifFormValues): void;
  handleCancel?(): void;
}

const WazaifAndRaabta = ({ karkun, handleFinish, handleCancel }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  }

  return (
    <>
      <Form layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <DateField
          fieldName="lastTarteebDate"
          fieldLabel="Last Tarteeb"
          initialValue={
            karkun.lastTarteebDate
              ? dayjs(Number(karkun.lastTarteebDate))
              : null
          }
        />

        <InputTextField
          fieldName="mehfilRaabta"
          fieldLabel="Mehfil Visits"
          placeholder="e.g. 3 days a week"
          initialValue={karkun.mehfilRaabta}
        />

        <InputTextField
          fieldName="msRaabta"
          fieldLabel="Multan Shareef Visits"
          placeholder="e.g. Once every month"
          initialValue={karkun.msRaabta}
        />

        <DateField
          fieldName="msLastVisitDate"
          fieldLabel="Last MS Visit"
          initialValue={
            karkun.msLastVisitDate
              ? dayjs(Number(karkun.msLastVisitDate))
              : null
          }
        />

        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={karkun} />
    </>
  );
};

export default WazaifAndRaabta;
