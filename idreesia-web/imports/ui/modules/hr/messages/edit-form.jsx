import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import {
  FilterTarget,
  MessageStatus,
} from 'meteor/idreesia-common/constants/communication';
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

import { HR_MESSAGE_BY_ID, PAGED_HR_MESSAGES, UPDATE_HR_MESSAGE } from './gql';
import KarkunsPreview from './karkuns-preview';
import { separateDutyAndShifts } from './helpers';

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

  const { validateFields, isFieldsTouched } = form;

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

        updateHrMessage({
          variables: {
            _id: messageId,
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

  const {
    hrMessageById: { messageBody, recepientFilters, status },
  } = data;

  const _recepientFilter = recepientFilters ? recepientFilters[0] : null;
  const dutyShiftTreeData = getDutyShiftTreeData(allMSDuties, allMSDutyShifts);

  return (
    <>
      <Form layout="horizontal" onSubmit={handleSubmit}>
        <InputTextAreaField
          fieldName="messageBody"
          fieldLabel="Message"
          required
          requiredMessage="Please input the message to send."
          initialValue={messageBody}
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
        />
        <LastTarteebFilterField
          fieldName="lastTarteeb"
          fieldLabel="Last Tarteeb"
          required={false}
          initialValue={_recepientFilter ? _recepientFilter.lastTarteeb : null}
        />
        <SelectField
          mode="multiple"
          fieldName="jobIds"
          fieldLabel="Jobs"
          required={false}
          data={allJobs}
          getDataValue={({ _id }) => _id}
          getDataText={({ name: _name }) => _name}
          initialValue={_recepientFilter ? _recepientFilter.jobIds : null}
        />
        <TreeMultiSelectField
          data={dutyShiftTreeData}
          fieldName="dutyIdShiftIds"
          fieldLabel="Duties/Shifts"
          required={false}
          initialValue={
            _recepientFilter
              ? [
                  ...(_recepientFilter.dutyIds || []),
                  ...(_recepientFilter.dutyShiftIds || []),
                ]
              : []
          }
        />
        <Divider />
        <FormButtonsSaveCancelExtra
          extraText="Preview Karkuns"
          handleCancel={handleCancel}
          handleExtra={handlePeviewKarkuns}
          allowSubmit={status === MessageStatus.WAITING_APPROVAL}
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

EditForm.propTypes = {
  form: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default Form.create()(EditForm);
