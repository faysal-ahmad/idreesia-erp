import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useMutation } from '@apollo/react-hooks';
import { Divider, Drawer, Form, message } from 'antd';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { FilterTarget } from 'meteor/idreesia-common/constants/communication';
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

import { PAGED_OUTSTATION_MESSAGES, CREATE_OUTSTATION_MESSAGE } from './gql';
import KarkunsPreview from './karkuns-preview';

const NewForm = ({ history, location }) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [showPreview, setShowPreview] = useState(false);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [recepientFilter, setRecepientFilter] = useState(null);
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
    const dutyIds = form.getFieldValue('dutyIds');
    const cityIdMehfilId = form.getFieldValue('cityIdMehfilId');
    const region = form.getFieldValue('region');

    const filter = {
      lastTarteeb,
      dutyIds,
      cityId: cityIdMehfilId ? cityIdMehfilId[0] : null,
      cityMehfilId: cityIdMehfilId ? cityIdMehfilId[1] : null,
      region,
    };

    setShowPreview(true);
    setRecepientFilter(filter);
  };

  const handleFinish = ({ messageBody, lastTarteeb, dutyIds, cityIdMehfilId, region }) => {
    createOutstationMessage({
      variables: {
        messageBody,
        recepientFilter: {
          filterTarget: FilterTarget.OUTSTATION_KARKUNS,
          lastTarteeb,
          dutyIds,
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

  return (
    <>
      <Form form={form} layout="horizontal" onFinish={handleFinish} onFieldsChange={handleFieldsChange}>
        <InputTextAreaField
          fieldName="messageBody"
          fieldLabel="Message"
          required
          requiredMessage="Please input the message to send."
        />
        <Divider>Karkuns Selection Criteria</Divider>
        <LastTarteebFilterField
          fieldName="lastTarteeb"
          fieldLabel="Last Tarteeb"
        />
        <SelectField
          mode="multiple"
          fieldName="dutyIds"
          fieldLabel="Duties"
          required={false}
          data={allMehfilDuties}
          getDataValue={({ _id }) => _id}
          getDataText={({ name: _name }) => _name}
          initialValue={[]}
        />
        <CascaderField
          data={cityMehfilCascaderData}
          fieldName="cityIdMehfilId"
          fieldLabel="City / Mehfil"
        />
        <AutoCompleteField
          fieldName="region"
          fieldLabel="Region"
          dataSource={distinctRegions}
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
        open={showPreview}
      >
        <KarkunsPreview recepientFilter={recepientFilter} />
      </Drawer>
    </>
  );
};

NewForm.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default NewForm;
