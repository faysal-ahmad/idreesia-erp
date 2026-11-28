import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { PlusCircleOutlined } from '@ant-design/icons';
import { Button, Form, Modal } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import {
  CITY_MEHFIL_TYPES,
  LocationPickerField,
  PersonPickerDrawer,
  toCityMehfilIds,
  useReferenceLocations,
  type PickerPerson,
} from '/imports/ui/modules/helpers/controls';

import { PROMOTE_HR_KARKUN, hrKarkunCandidateSource } from '../gql';

interface LocationFormValues {
  /** The picked city or mehfil. */
  locationId?: string;
}

const AddKarkunButton = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  // The person picked, whose city (and mehfil) is asked for before adding.
  const [picked, setPicked] = useState<PickerPerson | null>(null);
  const [form] = Form.useForm<LocationFormValues>();
  const { locations } = useReferenceLocations(CITY_MEHFIL_TYPES);
  // HR karkuns belong to Multan, so it is picked unless changed.
  const multanCityId = locations.find(
    location => location.type === OrgLocationTypes.CITY && location.name === 'Multan'
  )?._id;
  const [promoteHrKarkun, { loading: promoting }] = useMutation(PROMOTE_HR_KARKUN, {
    refetchQueries: ['hrKarkunsPagedHrKarkuns'],
  });

  const handlePick = (person: PickerPerson) => {
    form.resetFields();
    setPicked(person);
  };

  const handleAdd = ({ locationId }: LocationFormValues) => {
    const { cityLocationId, mehfilLocationId } = toCityMehfilIds(locationId, locations);
    if (!picked || !cityLocationId) return;

    promoteHrKarkun({
      variables: {
        _id: picked._id,
        cityLocationId,
        mehfilLocationId: mehfilLocationId ?? null,
      },
    })
      .then(() => {
        setPicked(null);
        message.success('Karkun added', 2);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  return (
    <>
      <PersonPickerDrawer
        title="Add Karkun"
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        source={hrKarkunCandidateSource}
        itemsLabel="people"
        mode="single"
        addLabel="Select"
        onPick={handlePick}
      />
      <Modal
        title={`Add ${picked?.name ?? ''} as a Karkun`}
        open={picked != null}
        okText="Add Karkun"
        confirmLoading={promoting}
        onOk={() => form.submit()}
        onCancel={() => setPicked(null)}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          style={{ width: '100%', maxWidth: '100%' }}
          onFinish={handleAdd}
          preserve={false}
          key={multanCityId ?? 'loading'}
        >
          <LocationPickerField
            types={CITY_MEHFIL_TYPES}
            fieldName="locationId"
            fieldLabel="City/Mehfil"
            fieldLayout={{}}
            initialValue={multanCityId}
            placeholder="Select the city, or its mehfil if known"
            required
            requiredMessage="Please select a city or a mehfil."
          />
        </Form>
      </Modal>
      <Button
        type="primary"
        icon={<PlusCircleOutlined />}
        onClick={() => setShowDrawer(true)}
      >
        Add Karkun
      </Button>
    </>
  );
};

export default AddKarkunButton;
