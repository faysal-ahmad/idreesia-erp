import React from 'react';
import PropTypes from 'prop-types';
import { useQuery, useMutation } from '@apollo/react-hooks';
import moment from 'moment';

import { values } from 'meteor/idreesia-common/utilities/lodash';
import { ImdadRequestStatus } from 'meteor/idreesia-common/constants/imdad';
import { useAllImdadReasons } from 'meteor/idreesia-common/hooks/imdad';

import { Form, message } from '/imports/ui/controls';
import { AuditInfo } from '/imports/ui/modules/common';
import {
  DateField,
  InputTextAreaField,
  SelectField,
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
      refetchQueries: [
        { query: PAGED_ACCOUNTS_IMDAD_REQUESTS, variables: { filter: {} } },
      ],
      awaitRefetchQueries: true,
    }
  );

  const { allImdadReasons, allImdadReasonsLoading } = useAllImdadReasons();
  const { data, loading } = useQuery(ACCOUNTS_IMDAD_REQUEST_BY_ID, {
    variables: { _id: requestId },
  });

  if (loading || allImdadReasonsLoading) return null;
  const { accountsImdadRequestById } = data;
  const { getFieldDecorator, isFieldsTouched } = form;

  const handleCancel = () => {
    history.goBack();
  };

  const handleSubmit = e => {
    e.preventDefault();
    form.validateFields((err, { imdadReasonId, status, notes }) => {
      if (err) return;

      updateAccountsImdadRequest({
        variables: {
          _id: requestId,
          imdadReasonId,
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

        <SelectField
          data={values(ImdadRequestStatus)}
          getDataValue={status => status}
          getDataText={status => status}
          fieldName="status"
          fieldLabel="Status"
          allowClear={false}
          initialValue={accountsImdadRequestById.status}
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

        <SelectField
          data={allImdadReasons}
          getDataValue={({ _id }) => _id}
          getDataText={({ name }) => name}
          fieldName="imdadReasonId"
          fieldLabel="Request Reason"
          required
          requiredMessage="Please select an Imdad Request Reason."
          initialValue={accountsImdadRequestById.imdadReasonId}
          getFieldDecorator={getFieldDecorator}
        />

        <InputTextAreaField
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
