import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useMutation } from '@apollo/react-hooks';
import { useDispatch } from 'react-redux';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useAllImdadReasons } from 'meteor/idreesia-common/hooks/imdad';
import { Form, message } from '/imports/ui/controls';
import {
  PAGED_OPERATIONS_IMDAD_REQUESTS,
  CREATE_OPERATIONS_IMDAD_REQUEST,
} from './gql';

import {
  DateField,
  InputTextAreaField,
  SelectField,
  VisitorSelectionInputField,
  FormButtonsSaveCancel,
} from '/imports/ui/modules/helpers/fields';

const NewForm = ({ form, history, location }) => {
  const dispatch = useDispatch();
  const { allImdadReasons, allImdadReasonsLoading } = useAllImdadReasons();
  const [createOperationsImdadRequest] = useMutation(
    CREATE_OPERATIONS_IMDAD_REQUEST,
    {
      refetchQueries: [{ query: PAGED_OPERATIONS_IMDAD_REQUESTS }],
      awaitRefetchQueries: true,
    }
  );

  useEffect(() => {
    dispatch(setBreadcrumbs(['Operations', 'Imdad Requests', 'New']));
  }, [location]);

  if (allImdadReasonsLoading) return null;

  const handleCancel = () => {
    history.goBack();
  };

  const handleSubmit = e => {
    e.preventDefault();
    form.validateFields(
      (err, { requestDate, visitor, imdadReasonId, notes }) => {
        if (err) return;

        createOperationsImdadRequest({
          variables: {
            requestDate,
            visitorId: visitor._id,
            imdadReasonId,
            notes,
          },
        })
          .then(() => {
            history.goBack();
          })
          .catch(error => {
            message.error(error.message, 5);
          });
      }
    );
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

      <SelectField
        data={allImdadReasons}
        getDataValue={({ _id }) => _id}
        getDataText={({ name }) => name}
        fieldName="imdadReasonId"
        fieldLabel="Request Reason"
        required
        requiredMessage="Please select an Imdad Request Reason."
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
