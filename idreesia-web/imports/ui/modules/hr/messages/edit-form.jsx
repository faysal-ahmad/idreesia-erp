import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { FilterTarget } from 'meteor/idreesia-common/constants/communication';
import {
  useAllJobs,
  useAllMSDuties,
  useAllMSDutyShifts,
} from 'meteor/idreesia-common/hooks/hr';
import { Divider, Drawer, Form, message } from '/imports/ui/controls';
import {
  CascaderField,
  InputTextAreaField,
  LastTarteebFilterField,
  SelectField,
  FormButtonsSaveCancelExtra,
} from '/imports/ui/modules/helpers/fields';
import { getDutyShiftCascaderData } from '/imports/ui/modules/hr/common/utilities';

import { HR_MESSAGE_BY_ID, PAGED_HR_MESSAGES, UPDATE_HR_MESSAGE } from './gql';
import KarkunsPreview from './karkuns-preview';

const EditForm = ({ form, history, location }) => {
  const dispatch = useDispatch();
  const { messageId } = useParams();
  const [showPreview, setShowPreview] = useState(false);
  const [recepientFilter, setRecepientFilter] = useState(null);
  const [updateHrMessage] = useMutation(UPDATE_HR_MESSAGE, {
    refetchQueries: [{ query: PAGED_HR_MESSAGES }],
  });
  const { data, loading } = useQuery(HR_MESSAGE_BY_ID, {
    variables: {
      _id: messageId,
    },
  });

  const { allJobs, allJobsLoading } = useAllJobs();
  const { allMSDuties, allMSDutiesLoading } = useAllMSDuties();
  const { allMSDutyShifts, allMSDutyShiftsLoading } = useAllMSDutyShifts();

  useEffect(() => {
    dispatch(setBreadcrumbs(['HR', 'Messages', 'Edit']));
  }, [location]);

  if (
    loading ||
    allJobsLoading ||
    allMSDutiesLoading ||
    allMSDutyShiftsLoading
  ) {
    return null;
  }

  const { getFieldDecorator, validateFields, isFieldsTouched } = form;

  const handleCancel = () => {
    history.goBack();
  };

  const handlePeviewKarkuns = () => {
    const bloodGroup = form.getFieldValue('bloodGroup');
    const lastTarteeb = form.getFieldValue('lastTarteeb');
    const jobId = form.getFieldValue('jobId');
    const dutyIdShiftId = form.getFieldValue('dutyIdShiftId');

    const dutyId = dutyIdShiftId ? dutyIdShiftId[0] : null;
    const dutyShiftId = dutyIdShiftId ? dutyIdShiftId[1] : null;
    const filter = {
      bloodGroup,
      lastTarteeb,
      jobId,
      dutyId,
      dutyShiftId,
    };

    setShowPreview(true);
    setRecepientFilter(filter);
  };

  const handleSubmit = e => {
    e.preventDefault();
    validateFields(
      (err, { messageBody, bloodGroup, lastTarteeb, jobId, dutyIdShiftId }) => {
        if (err) return;

        updateHrMessage({
          variables: {
            _id: messageId,
            messageBody,
            recepientFilter: {
              filterTarget: FilterTarget.MS_KARKUNS,
              bloodGroup,
              lastTarteeb,
              jobId,
              dutyId: dutyIdShiftId ? dutyIdShiftId[0] : null,
              dutyShiftId: dutyIdShiftId ? dutyIdShiftId[1] : null,
            },
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

  const {
    hrMessageById: { messageBody, recepientFilters },
  } = data;

  const _recepientFilter = recepientFilters ? recepientFilters[0] : null;
  const dutyShiftCascaderData = getDutyShiftCascaderData(
    allMSDuties,
    allMSDutyShifts
  );

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
        <Divider>Karkuns Selection Criteria</Divider>
        <SelectField
          fieldName="bloodGroup"
          fieldLabel="Blood Group"
          required={false}
          data={[
            { label: 'A-', value: 'A-' },
            { label: 'A+', value: 'Aplus' },
            { label: 'B-', value: 'B-' },
            { label: 'B+', value: 'Bplus' },
            { label: 'AB-', value: 'AB-' },
            { label: 'AB+', value: 'ABplus' },
            { label: 'O-', value: 'O-' },
            { label: 'O+', value: 'Oplus' },
          ]}
          getDataValue={({ value }) => value}
          getDataText={({ label }) => label}
          initialValue={_recepientFilter ? _recepientFilter.bloodGroup : null}
          getFieldDecorator={getFieldDecorator}
        />
        <LastTarteebFilterField
          fieldName="lastTarteeb"
          fieldLabel="Last Tarteeb"
          required={false}
          initialValue={_recepientFilter ? _recepientFilter.lastTarteeb : null}
          getFieldDecorator={getFieldDecorator}
        />
        <SelectField
          fieldName="jobId"
          fieldLabel="Job"
          required={false}
          data={allJobs}
          getDataValue={({ _id }) => _id}
          getDataText={({ name: _name }) => _name}
          initialValue={_recepientFilter ? _recepientFilter.jobId : null}
          getFieldDecorator={getFieldDecorator}
        />
        <CascaderField
          data={dutyShiftCascaderData}
          fieldName="dutyIdShiftId"
          fieldLabel="Duty/Shift"
          required={false}
          initialValue={
            _recepientFilter
              ? [_recepientFilter.dutyId, _recepientFilter.dutyShiftId]
              : null
          }
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
        <KarkunsPreview filter={recepientFilter} />
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
