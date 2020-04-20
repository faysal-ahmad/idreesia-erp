import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation } from '@apollo/react-hooks';

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

import { PAGED_HR_MESSAGES, CREATE_HR_MESSAGE } from './gql';
import KarkunsPreview from './karkuns-preview';

const NewForm = ({ form, history, location }) => {
  const dispatch = useDispatch();
  const [showPreview, setShowPreview] = useState(false);
  const [karkunFilter, setKarkunFilter] = useState(null);
  const [createHrMessage] = useMutation(CREATE_HR_MESSAGE, {
    refetchQueries: [{ query: PAGED_HR_MESSAGES }],
  });

  const { allJobs, allJobsLoading } = useAllJobs();
  const { allMSDuties, allMSDutiesLoading } = useAllMSDuties();
  const { allMSDutyShifts, allMSDutyShiftsLoading } = useAllMSDutyShifts();

  useEffect(() => {
    dispatch(setBreadcrumbs(['HR', 'Messages', 'New']));
  }, [location]);

  if (allJobsLoading || allMSDutiesLoading || allMSDutyShiftsLoading) {
    return null;
  }

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
    validateFields(
      (err, { messageBody, bloodGroup, lastTarteeb, jobId, dutyIdShiftId }) => {
        if (err) return;

        createHrMessage({
          variables: {
            messageBody,
            karkunFilter: {
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
          getFieldDecorator={getFieldDecorator}
        />
        <LastTarteebFilterField
          fieldName="lastTarteeb"
          fieldLabel="Last Tarteeb"
          required={false}
          getFieldDecorator={getFieldDecorator}
        />
        <SelectField
          fieldName="jobId"
          fieldLabel="Job"
          required={false}
          data={allJobs}
          getDataValue={({ _id }) => _id}
          getDataText={({ name: _name }) => _name}
          getFieldDecorator={getFieldDecorator}
        />
        <CascaderField
          data={dutyShiftCascaderData}
          fieldName="dutyIdShiftId"
          fieldLabel="Duty/Shift"
          required={false}
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
