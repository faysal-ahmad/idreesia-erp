import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation } from '@apollo/react-hooks';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useAllMSDuties } from 'meteor/idreesia-common/hooks/hr';
import { Divider, Drawer, Form, message } from '/imports/ui/controls';
import {
  InputTextAreaField,
  SelectField,
  FormButtonsSaveCancelExtra,
} from '/imports/ui/modules/helpers/fields';

import { PAGED_HR_MESSAGES, CREATE_HR_MESSAGE } from './gql';
import KarkunsPreview from './karkuns-preview';

const NewForm = ({ form, history, location }) => {
  const dispatch = useDispatch();
  const [showPreview, setShowPreview] = useState(false);
  const [karkunFilter, setKarkunFilter] = useState(null);
  const [createHrMessage] = useMutation(CREATE_HR_MESSAGE, {
    refetchQueries: [{ query: PAGED_HR_MESSAGES }],
  });

  const { allMSDuties, allMSDutiesLoading } = useAllMSDuties();

  useEffect(() => {
    dispatch(setBreadcrumbs(['HR', 'Messages', 'New']));
  }, [location]);

  if (allMSDutiesLoading) return null;

  const { getFieldDecorator, validateFields, isFieldsTouched } = form;

  const handleCancel = () => {
    history.goBack();
  };

  const handlePeviewKarkuns = () => {
    const dutyId = form.getFieldValue('dutyId');
    const filter = { dutyId };
    setShowPreview(true);
    setKarkunFilter(filter);
  };

  const handleSubmit = e => {
    e.preventDefault();
    validateFields((err, { messageBody, dutyId }) => {
      if (err) return;

      createHrMessage({
        variables: {
          messageBody,
          karkunFilter: {
            dutyId,
          },
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
        <InputTextAreaField
          fieldName="messageBody"
          fieldLabel="Message"
          required
          requiredMessage="Please input the message to send."
          getFieldDecorator={getFieldDecorator}
        />
        <Divider>Karkuns Filter Criteria</Divider>
        <SelectField
          fieldName="dutyId"
          fieldLabel="Duty"
          data={allMSDuties}
          getDataValue={({ _id }) => _id}
          getDataText={({ name: _name }) => _name}
          getFieldDecorator={getFieldDecorator}
        />
        <Divider />
        <FormButtonsSaveCancelExtra
          extraText="Preview Karkuns"
          handleCancel={handleCancel}
          handleExtra={handlePeviewKarkuns}
          isFieldsTouched={isFieldsTouched}
        />
      </Form>
      <Drawer
        title="Preview Karkuns"
        width={720}
        onClose={() => {
          setShowPreview(false);
        }}
        visible={showPreview}
      >
        <KarkunsPreview filter={karkunFilter} />
      </Drawer>
    </>
  );
};

NewForm.propTypes = {
  form: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default Form.create()(NewForm);
