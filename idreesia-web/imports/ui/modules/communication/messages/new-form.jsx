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
  InputTextAreaField,
  LastTarteebFilterField,
  SelectField,
  TreeMultiSelectField,
  FormButtonsSaveCancelExtra,
} from '/imports/ui/modules/helpers/fields';
import { getDutyShiftTreeData } from '/imports/ui/modules/hr/common/utilities';

import { PAGED_COMM_MESSAGES, CREATE_COMM_MESSAGE } from './gql';
import KarkunsPreview from './karkuns-preview';
import { separateDutyAndShifts } from './helpers';

const NewForm = ({ form, history, location }) => {
  const dispatch = useDispatch();
  const [showPreview, setShowPreview] = useState(false);
  const [recepientFilter, setRecepientFilter] = useState(null);
  const [createCommMessage] = useMutation(CREATE_COMM_MESSAGE, {
    refetchQueries: [{ query: PAGED_COMM_MESSAGES }],
  });

  const { allJobs, allJobsLoading } = useAllJobs();
  const { allMSDuties, allMSDutiesLoading } = useAllMSDuties();
  const { allMSDutyShifts, allMSDutyShiftsLoading } = useAllMSDutyShifts();

  useEffect(() => {
    dispatch(setBreadcrumbs(['Communication', 'Messages', 'New']));
  }, [location]);

  if (allJobsLoading || allMSDutiesLoading || allMSDutyShiftsLoading) {
    return null;
  }

  const { getFieldDecorator, validateFields, isFieldsTouched } = form;

  const handleCancel = () => {
    history.goBack();
  };

  const handlePeviewKarkuns = () => {
    const bloodGroup = form.getFieldValue('bloodGroup');
    const lastTarteeb = form.getFieldValue('lastTarteeb');
    const jobIds = form.getFieldValue('jobIds');
    const dutyIdShiftIds = form.getFieldValue('dutyIdShiftIds');

    const { dutyIds, dutyShiftIds } = separateDutyAndShifts(
      dutyIdShiftIds,
      allMSDuties,
      allMSDutyShifts
    );

    const filter = {
      bloodGroup,
      lastTarteeb,
      jobIds,
      dutyIds,
      dutyShiftIds,
    };

    setShowPreview(true);
    setRecepientFilter(filter);
  };

  const handleSubmit = e => {
    e.preventDefault();
    validateFields(
      (
        err,
        { messageBody, bloodGroup, lastTarteeb, jobIds, dutyIdShiftIds }
      ) => {
        if (err) return;

        const { dutyIds, dutyShiftIds } = separateDutyAndShifts(
          dutyIdShiftIds,
          allMSDuties,
          allMSDutyShifts
        );

        createCommMessage({
          variables: {
            messageBody,
            recepientFilter: {
              filterTarget: FilterTarget.MS_KARKUNS,
              bloodGroup,
              lastTarteeb,
              jobIds,
              dutyIds,
              dutyShiftIds,
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

  const dutyShiftTreeData = getDutyShiftTreeData(allMSDuties, allMSDutyShifts);

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
          mode="multiple"
          fieldName="jobIds"
          fieldLabel="Jobs"
          required={false}
          data={allJobs}
          getDataValue={({ _id }) => _id}
          getDataText={({ name: _name }) => _name}
          initialValue={[]}
          getFieldDecorator={getFieldDecorator}
        />
        <TreeMultiSelectField
          data={dutyShiftTreeData}
          fieldName="dutyIdShiftIds"
          fieldLabel="Duties/Shifts"
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
        <KarkunsPreview recepientFilter={recepientFilter} />
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
