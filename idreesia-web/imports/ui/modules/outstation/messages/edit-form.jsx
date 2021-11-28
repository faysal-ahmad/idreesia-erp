import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';
import { Divider, Drawer, Form, message } from 'antd';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import {
  useAllCities,
  useAllCityMehfils,
  useAllMehfilDuties,
  useDistinctRegions,
} from 'meteor/idreesia-common/hooks/outstation';
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

const EditForm = ({ history, location }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { messageId } = useParams();
  const [showPreview, setShowPreview] = useState(false);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
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

  const cityMehfilCascaderData = getCityMehfilCascaderData(
    allCities,
    allCityMehfils
  );

  const handleCancel = () => {
    history.goBack();
  };

  const handleFieldsChange = () => {
    setIsFieldsTouched(true);
  }

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

  const handleFinish = ({ messageBody, lastTarteeb, dutyId, cityIdMehfilId, region }) => {
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
  };

  const {
    outstationMessageById: { messageBody, recepientFilters },
  } = data;

  const _recepientFilter = recepientFilters ? recepientFilters[0] : null;

  return (
    <>
      <Form form={form} layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <InputTextAreaField
          fieldName="messageBody"
          fieldLabel="Message"
          required
          requiredMessage="Please input the message to send."
          initialValue={messageBody}
        />
        <Divider>Karkuns Selection Criteria</Divider>
        <LastTarteebFilterField
          fieldName="lastTarteeb"
          fieldLabel="Last Tarteeb"
          initialValue={_recepientFilter ? _recepientFilter.lastTarteeb : null}
        />
        <SelectField
          fieldName="dutyId"
          fieldLabel="Duty"
          data={allMehfilDuties}
          getDataValue={({ _id }) => _id}
          getDataText={({ name: _name }) => _name}
          initialValue={_recepientFilter ? _recepientFilter.dutyId : null}
        />
        <CascaderField
          data={cityMehfilCascaderData}
          fieldName="cityIdMehfilId"
          fieldLabel="City / Mehfil"
          initialValue={[
            _recepientFilter ? _recepientFilter.cityId : null,
            _recepientFilter ? _recepientFilter.cityMehfilId : null,
          ]}
        />
        <AutoCompleteField
          fieldName="region"
          fieldLabel="Region"
          dataSource={distinctRegions}
          initialValue={_recepientFilter ? _recepientFilter.region : null}
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
  history: PropTypes.object,
  location: PropTypes.object,
};

export default EditForm;
