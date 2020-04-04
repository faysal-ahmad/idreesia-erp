import React from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/react-hooks';
import moment from 'moment';

import { Form, message } from '/imports/ui/controls';
import { AuditInfo } from '/imports/ui/modules/common';
import {
  DateField,
  TextAreaField,
  VisitorSelectionInputField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

import {
  ACCOUNTS_IMDAD_REQUEST_BY_ID,
  UPDATE_ACCOUNTS_IMDAD_REQUEST,
  PAGED_ACCOUNTS_IMDAD_REQUESTS,
} from '../gql';

const GeneralInfo = ({ requestId, form, history }) => {
  const [updateAccountsImdadRequest] = useMutation(
    UPDATE_ACCOUNTS_IMDAD_REQUEST,
    {
      refetchQueries: [{ query: PAGED_ACCOUNTS_IMDAD_REQUESTS }],
      awaitRefetchQueries: true,
    }
  );

  const { data, loading } = useQuery(ACCOUNTS_IMDAD_REQUEST_BY_ID, {
    variables: { _id: requestId },
  });

  if (loading) return null;
  const { accountsImdadRequestById } = data;
  const { getFieldDecorator, isFieldsTouched } = form;

  const handleCancel = () => {
    history.goBack();
  };

  const handleSubmit = e => {
    e.preventDefault();
    form.validateFields((err, { status, notes }) => {
      if (err) return;

      updateAccountsImdadRequest({
        variables: {
          _id: requestId,
          status,
          notes,
        },
      })
        .then(() => {
          history.goBack();
        })
        .catch(error => {
          message.error(error.message, 5);
        });
    });
  };

  return (
    <>
      <Form layout="horizontal" onSubmit={handleSubmit}>
        <DateField
          fieldName="requestDate"
          fieldLabel="Request Date"
          required
          requiredMessage="Please select a Request Date."
          initialValue={moment(Number(accountsImdadRequestById.requestDate))}
          getFieldDecorator={getFieldDecorator}
        />

        <VisitorSelectionInputField
          fieldName="visitor"
          fieldLabel="Person"
          required
          requiredMessage="Please select a Person"
          initialValue={accountsImdadRequestById.visitor}
          getFieldDecorator={getFieldDecorator}
        />

        <TextAreaField
          fieldName="notes"
          fieldLabel="Notes"
          initialValue={accountsImdadRequestById.notes}
          getFieldDecorator={getFieldDecorator}
        />

        <FormButtonsSaveCancel
          handleCancel={handleCancel}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <AuditInfo record={accountsImdadRequestById} />
    </>
  );
};

GeneralInfo.propTypes = {
  requestId: PropTypes.string,
  history: PropTypes.object,
  match: PropTypes.object,
  location: PropTypes.object,
  form: PropTypes.object,
};

export default Form.create()(GeneralInfo);
