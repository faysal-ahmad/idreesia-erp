import React, { useState } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { Form } from 'antd';

import {
  DateField,
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';

const AntForm = Form as any;
const DateInputField = DateField as any;
const TextField = InputTextField as any;
const SaveCancelButtons = FormButtonsSaveCancel as any;
const AuditInfoComponent = AuditInfo as any;
type AnyRecord = Record<string, any>;
interface Props { karkun: AnyRecord; handleFinish(values: AnyRecord): void; handleCancel?(): void; }

const WazaifAndRaabta = ({ karkun, handleFinish, handleCancel }: Props) => {
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  }

  return (
    <>
      <AntForm layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <DateInputField
          fieldName="lastTarteebDate"
          fieldLabel="Last Tarteeb"
          initialValue={
            karkun.lastTarteebDate
              ? dayjs(Number(karkun.lastTarteebDate))
              : null
          }
        />

        <TextField
          fieldName="mehfilRaabta"
          fieldLabel="Mehfil Visits"
          placeholder="e.g. 3 days a week"
          initialValue={karkun.mehfilRaabta}
        />

        <TextField
          fieldName="msRaabta"
          fieldLabel="Multan Shareef Visits"
          placeholder="e.g. Once every month"
          initialValue={karkun.msRaabta}
        />

        <DateInputField
          fieldName="msLastVisitDate"
          fieldLabel="Last MS Visit"
          initialValue={
            karkun.msLastVisitDate
              ? dayjs(Number(karkun.msLastVisitDate))
              : null
          }
        />

        <SaveCancelButtons
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </AntForm>
      <AuditInfoComponent record={karkun} />
    </>
  );
};

WazaifAndRaabta.propTypes = {
  karkun: PropTypes.object,
  handleFinish: PropTypes.func,
  handleCancel: PropTypes.func,
};

export default WazaifAndRaabta;
