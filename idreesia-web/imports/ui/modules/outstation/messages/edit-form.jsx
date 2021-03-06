import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import {
  useAllCities,
  useAllCityMehfils,
  useAllMehfilDuties,
  useDistinctRegions,
} from 'meteor/idreesia-common/hooks/outstation';
import { Divider, Drawer, Form, message } from '/imports/ui/controls';
import {
  AutoCompleteField,
  CascaderField,
  InputTextAreaField,
  SelectField,
  LastTarteebFilterField,
  FormButtonsSaveCancelExtra,
} from '/imports/ui/modules/helpers/fields';
import { getCityMehfilCascaderData } from '/imports/ui/modules/common/utilities';

import {
  OUTSTATION_MESSAGE_BY_ID,
  PAGED_OUTSTATION_MESSAGES,
  UPDATE_OUTSTATION_MESSAGE,
} from './gql';
import KarkunsPreview from './karkuns-preview';

const EditForm = ({ form, history, location }) => {
  const dispatch = useDispatch();
  const { messageId } = useParams();
  const [showPreview, setShowPreview] = useState(false);
  const [recepientFilter, setRecepientFilter] = useState(null);
  const [updateOutstationMessage] = useMutation(UPDATE_OUTSTATION_MESSAGE, {
    refetchQueries: [{ query: PAGED_OUTSTATION_MESSAGES }],
  });
  const { data, loading } = useQuery(OUTSTATION_MESSAGE_BY_ID, {
    variables: {
      _id: messageId,
    },
  });

  const { allMehfilDuties, allMehfilDutiesLoading } = useAllMehfilDuties();
  const { allCities, allCitiesLoading } = useAllCities();
  const { allCityMehfils, allCityMehfilsLoading } = useAllCityMehfils();
  const { distinctRegions, distinctRegionsLoading } = useDistinctRegions();

  useEffect(() => {
    dispatch(setBreadcrumbs(['Outstation', 'Messages', 'Edit']));
  }, [location]);

  if (
    loading ||
    allMehfilDutiesLoading ||
    allCitiesLoading ||
    allCityMehfilsLoading ||
    distinctRegionsLoading
  ) {
    return null;
  }

  const { getFieldDecorator, validateFields, isFieldsTouched } = form;
  const cityMehfilCascaderData = getCityMehfilCascaderData(
    allCities,
    allCityMehfils
  );

  const handleCancel = () => {
    history.goBack();
  };

  const handlePeviewKarkuns = () => {
    const lastTarteeb = form.getFieldValue('lastTarteeb');
    const dutyId = form.getFieldValue('dutyId');
    const cityIdMehfilId = form.getFieldValue('cityIdMehfilId');
    const region = form.getFieldValue('region');

    const filter = {
      lastTarteeb,
      dutyId,
      cityId: cityIdMehfilId ? cityIdMehfilId[0] : null,
      cityMehfilId: cityIdMehfilId ? cityIdMehfilId[1] : null,
      region,
    };

    setShowPreview(true);
    setRecepientFilter(filter);
  };

  const handleSubmit = e => {
    e.preventDefault();
    validateFields(
      (err, { messageBody, lastTarteeb, dutyId, cityIdMehfilId, region }) => {
        if (err) return;

        updateOutstationMessage({
          variables: {
            _id: messageId,
            messageBody,
            recepientFilter: {
              lastTarteeb,
              dutyId,
              cityId: cityIdMehfilId ? cityIdMehfilId[0] : null,
              cityMehfilId: cityIdMehfilId ? cityIdMehfilId[1] : null,
              region,
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
    outstationMessageById: { messageBody, recepientFilters },
  } = data;

  const _recepientFilter = recepientFilters ? recepientFilters[0] : null;

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
        <LastTarteebFilterField
          fieldName="lastTarteeb"
          fieldLabel="Last Tarteeb"
          initialValue={_recepientFilter ? _recepientFilter.lastTarteeb : null}
          getFieldDecorator={getFieldDecorator}
        />
        <SelectField
          fieldName="dutyId"
          fieldLabel="Duty"
          data={allMehfilDuties}
          getDataValue={({ _id }) => _id}
          getDataText={({ name: _name }) => _name}
          initialValue={_recepientFilter ? _recepientFilter.dutyId : null}
          getFieldDecorator={getFieldDecorator}
        />
        <CascaderField
          data={cityMehfilCascaderData}
          fieldName="cityIdMehfilId"
          fieldLabel="City / Mehfil"
          initialValue={[
            _recepientFilter ? _recepientFilter.cityId : null,
            _recepientFilter ? _recepientFilter.cityMehfilId : null,
          ]}
          getFieldDecorator={getFieldDecorator}
        />
        <AutoCompleteField
          fieldName="region"
          fieldLabel="Region"
          dataSource={distinctRegions}
          initialValue={_recepientFilter ? _recepientFilter.region : null}
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

EditForm.propTypes = {
  form: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default Form.create()(EditForm);
