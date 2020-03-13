import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useAllMSDuties } from 'meteor/idreesia-common/hooks/hr';
import { Divider, Drawer, Form, message } from '/imports/ui/controls';
import {
  InputTextAreaField,
  SelectField,
  FormButtonsSaveCancelExtra,
} from '/imports/ui/modules/helpers/fields';

import { HR_MESSAGE_BY_ID, PAGED_HR_MESSAGES, UPDATE_HR_MESSAGE } from './gql';
import KarkunsPreview from './karkuns-preview';

const EditForm = ({ form, history, location }) => {
  const dispatch = useDispatch();
  const { messageId } = useParams();
  const [showPreview, setShowPreview] = useState(false);
  const [karkunFilter, setKarkunFilter] = useState(null);
  const [updateHrMessage] = useMutation(UPDATE_HR_MESSAGE, {
    refetchQueries: [{ query: PAGED_HR_MESSAGES }],
  });
  const { data, loading } = useQuery(HR_MESSAGE_BY_ID, {
    variables: {
      _id: messageId,
    },
  });

  const { allMSDuties, allMSDutiesLoading } = useAllMSDuties();

  useEffect(() => {
    dispatch(setBreadcrumbs(['HR', 'Messages', 'Edit']));
  }, [location]);

  if (loading || allMSDutiesLoading) return null;

  const { getFieldDecorator, validateFields, isFieldsTouched } = form;

  const handleCancel = () => {
    history.goBack();
  };

  const handlePeviewKarkuns = () => {
    const dutyId = form.getFieldValue('dutyId');

    const filter = {
      dutyId,
    };

    setShowPreview(true);
    setKarkunFilter(filter);
  };

  const handleSubmit = e => {
    e.preventDefault();
    validateFields((err, { messageBody, dutyId }) => {
      if (err) return;

      updateHrMessage({
        variables: {
          _id: messageId,
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

  const {
    hrMessageById: { messageBody, karkunFilter: _karkunFilter },
  } = data;

  return (
    <>
      <Form layout="horizontal" onSubmit={handleSubmit}>
        <InputTextAreaField
          fieldName="messageBody"
          fieldLabel="Message"
          required
          requiredMessage="Please input the message to send."
          initialValue={messageBody}
          getFieldDecorator={getFieldDecorator}
        />
        <Divider>Karkuns Filter Criteria</Divider>
        <SelectField
          fieldName="dutyId"
          fieldLabel="Duty"
          data={allMSDuties}
          getDataValue={({ _id }) => _id}
          getDataText={({ name: _name }) => _name}
          initialValue={_karkunFilter ? _karkunFilter.dutyId : null}
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

EditForm.propTypes = {
  form: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default Form.create()(EditForm);
