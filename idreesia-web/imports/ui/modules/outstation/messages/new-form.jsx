import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation } from '@apollo/react-hooks';

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

import { PAGED_OUTSTATION_MESSAGES, CREATE_OUTSTATION_MESSAGE } from './gql';
import KarkunsPreview from './karkuns-preview';

const NewForm = ({ form, history, location }) => {
  const dispatch = useDispatch();
  const [showPreview, setShowPreview] = useState(false);
  const [karkunFilter, setKarkunFilter] = useState(null);
  const [createOutstationMessage] = useMutation(CREATE_OUTSTATION_MESSAGE, {
    refetchQueries: [{ query: PAGED_OUTSTATION_MESSAGES }],
  });

  const { allMehfilDuties, allMehfilDutiesLoading } = useAllMehfilDuties();
  const { allCities, allCitiesLoading } = useAllCities();
  const { allCityMehfils, allCityMehfilsLoading } = useAllCityMehfils();
  const { distinctRegions, distinctRegionsLoading } = useDistinctRegions();

  useEffect(() => {
    dispatch(setBreadcrumbs(['Outstation', 'Messages', 'New']));
  }, [location]);

  if (
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
    setKarkunFilter(filter);
  };

  const handleSubmit = e => {
    e.preventDefault();
    validateFields(
      (err, { messageBody, lastTarteeb, dutyId, cityIdMehfilId, region }) => {
        if (err) return;

        createOutstationMessage({
          variables: {
            messageBody,
            karkunFilter: {
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
        <LastTarteebFilterField
          fieldName="lastTarteeb"
          fieldLabel="Last Tarteeb"
          getFieldDecorator={getFieldDecorator}
        />
        <SelectField
          fieldName="dutyId"
          fieldLabel="Duty"
          data={allMehfilDuties}
          getDataValue={({ _id }) => _id}
          getDataText={({ name: _name }) => _name}
          getFieldDecorator={getFieldDecorator}
        />
        <CascaderField
          data={cityMehfilCascaderData}
          fieldName="cityIdMehfilId"
          fieldLabel="City / Mehfil"
          getFieldDecorator={getFieldDecorator}
        />
        <AutoCompleteField
          fieldName="region"
          fieldLabel="Region"
          dataSource={distinctRegions}
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
