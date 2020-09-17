import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import { Form } from '/imports/ui/controls';
import {
  DateField,
  InputTextField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';
import { AuditInfo } from '/imports/ui/modules/common';

const WazaifAndRaabta = ({ karkun, form, handleSubmit, handleCancel }) => {
  const _handleSubmit = e => {
    e.preventDefault();
    form.validateFields((err, values) => {
      if (err) return;
      handleSubmit(values);
    });
  };

  const { getFieldDecorator, isFieldsTouched } = form;

  return (
    <Fragment>
      <Form layout="horizontal" onSubmit={_handleSubmit}>
        <DateField
          fieldName="lastTarteebDate"
          fieldLabel="Last Tarteeb"
          initialValue={
            karkun.lastTarteebDate
              ? moment(Number(karkun.lastTarteebDate))
              : null
          }
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="mehfilRaabta"
          fieldLabel="Mehfil Visits"
          placeholder="e.g. 3 days a week"
          initialValue={karkun.mehfilRaabta}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextField
          fieldName="msRaabta"
          fieldLabel="Multan Shareef Visits"
          placeholder="e.g. Once every month"
          initialValue={karkun.msRaabta}
          getFieldDecorator={getFieldDecorator}
        />

        <DateField
          fieldName="msLastVisitDate"
          fieldLabel="Last MS Visit"
          initialValue={
            karkun.msLastVisitDate
              ? moment(Number(karkun.msLastVisitDate))
              : null
          }
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={karkun} />
    </Fragment>
  );
};

WazaifAndRaabta.propTypes = {
  form: PropTypes.object,
  karkun: PropTypes.object,
  handleSubmit: PropTypes.func,
  handleCancel: PropTypes.func,
};

export default Form.create()(WazaifAndRaabta);
