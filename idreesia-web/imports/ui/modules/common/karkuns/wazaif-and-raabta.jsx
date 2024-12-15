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

const WazaifAndRaabta = ({ karkun, handleFinish, handleCancel }) => {
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

WazaifAndRaabta.propTypes = {
  karkun: PropTypes.object,
  handleFinish: PropTypes.func,
  handleCancel: PropTypes.func,
};

export default WazaifAndRaabta;
