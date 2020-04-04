import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/react-hooks';
import { useDispatch } from 'react-redux';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { Form, message } from '/imports/ui/controls';
import {
  PAGED_ACCOUNTS_IMDAD_REQUESTS,
  CREATE_ACCOUNTS_IMDAD_REQUEST,
} from './gql';

import {
  DateField,
  InputTextAreaField,
  VisitorSelectionInputField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

const NewForm = ({ form, history, location }) => {
  const dispatch = useDispatch();
  const [createAccountsImdadRequest] = useMutation(
    CREATE_ACCOUNTS_IMDAD_REQUEST,
    {
      refetchQueries: [{ query: PAGED_ACCOUNTS_IMDAD_REQUESTS }],
      awaitRefetchQueries: true,
    }
  );

  useEffect(() => {
    dispatch(setBreadcrumbs(['Accounts', 'Imdad Requests', 'New']));
  }, [location]);

  const handleCancel = () => {
    history.goBack();
  };

  const handleSubmit = e => {
    e.preventDefault();
    form.validateFields((err, { requestDate, visitor, notes }) => {
      if (err) return;

      createAccountsImdadRequest({
        variables: {
          requestDate,
          visitorId: visitor._id,
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

  const { getFieldDecorator, isFieldsTouched } = form;

  return (
    <Form layout="horizontal" onSubmit={handleSubmit}>
      <DateField
        fieldName="requestDate"
        fieldLabel="Request Date"
        required
        requiredMessage="Please select a Request Date."
        getFieldDecorator={getFieldDecorator}
      />

      <VisitorSelectionInputField
        fieldName="visitor"
        fieldLabel="Person"
        required
        requiredMessage="Please select a Person"
        getFieldDecorator={getFieldDecorator}
      />

      <InputTextAreaField
        fieldName="notes"
        fieldLabel="Notes"
        getFieldDecorator={getFieldDecorator}
      />

      <FormButtonsSaveCancel
        handleCancel={handleCancel}
        isFieldsTouched={isFieldsTouched}
      />
    </Form>
  );
};

NewForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
  form: PropTypes.object,
};

export default Form.create()(NewForm);
