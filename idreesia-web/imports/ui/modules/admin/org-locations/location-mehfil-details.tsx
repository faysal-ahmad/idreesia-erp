import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { Button, Flex, Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import type { OrgLocationByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { FormButtonsSaveCancel } from '/imports/ui/modules/helpers/fields';

import { UPDATE_ORG_LOCATION } from './gql';
import { geocodeAddress } from './geocode-address';
import { toMehfilDetails } from './helpers';
import LocationMap from './location-map';
import { MehfilDetailsFields, type LocationFormValues } from './location-form';

type OrgLocation = NonNullable<OrgLocationByIdQuery['orgLocationById']>;

interface Pin {
  latitude: number | null;
  longitude: number | null;
}

interface Props {
  orgLocation: OrgLocation;
  onCancel(): void;
}

/** The Mehfil Details tab: the form on the left, the map beside it. */
const LocationMehfilDetails = ({ orgLocation, onCancel }: Props) => {
  const details = orgLocation.mehfilDetails;
  const [isTouched, setIsTouched] = useState(false);
  // Kept outside the form: the map is not a form field.
  const [pin, setPin] = useState<Pin>({
    latitude: details?.latitude ?? null,
    longitude: details?.longitude ?? null,
  });

  const [form] = Form.useForm<LocationFormValues>();
  const address = Form.useWatch('address', form);
  const [focusToken, setFocusToken] = useState(0);
  const [isLocating, setIsLocating] = useState(false);
  // A pin placed by hand, or already saved, is never replaced by an address
  // lookup that runs on its own.
  const [isPinProtected, setIsPinProtected] = useState(
    details?.latitude != null && details?.longitude != null
  );

  const locateFromAddress = async () => {
    const text = (form.getFieldValue('address') ?? '').trim();
    if (!text) return;
    setIsLocating(true);
    try {
      const result = await geocodeAddress(text);
      if (!result) {
        message.warning('Could not find this address on the map. Click the map to place the pin.', 5);
        return;
      }
      setPin({ latitude: result.latitude, longitude: result.longitude });
      setIsPinProtected(false);
      setFocusToken(token => token + 1);
      setIsTouched(true);
      if (!result.isFullMatch) {
        message.info(
          `Approximate location (matched "${result.matchedQuery}"). Drag the pin to adjust.`,
          6
        );
      }
    } catch (error) {
      message.error((error as Error).message, 5);
    } finally {
      setIsLocating(false);
    }
  };

  const handleAddressBlur = () => {
    if (!isPinProtected && !isLocating) locateFromAddress();
  };

  const [updateOrgLocation] = useMutation(UPDATE_ORG_LOCATION, {
    refetchQueries: ['allOrgLocations', 'orgLocationById'],
  });

  const handleFinish = (values: LocationFormValues) => {
    updateOrgLocation({
      variables: {
        _id: orgLocation._id as string,
        name: orgLocation.name ?? '',
        parentId: orgLocation.parentId,
        mehfilDetails: toMehfilDetails({ ...values, ...pin }),
      },
    })
      .then(() => {
        message.success('Mehfil details saved', 2);
        setIsTouched(false);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  return (
    <Flex gap={24} wrap align="flex-start">
      <Form
        form={form}
        layout="horizontal"
        style={{ flex: '0 1 640px', minWidth: 320 }}
        initialValues={{
          address: details?.address ?? undefined,
          mehfilStartYear: details?.mehfilStartYear ?? undefined,
          timingDetails: details?.timingDetails ?? undefined,
          lcdAvailability: details?.lcdAvailability ?? false,
          tabAvailability: details?.tabAvailability ?? false,
          otherMehfilDetails: details?.otherMehfilDetails ?? undefined,
        }}
        onFieldsChange={() => setIsTouched(true)}
        onFinish={handleFinish}
      >
        <MehfilDetailsFields onAddressBlur={handleAddressBlur} />
        <FormButtonsSaveCancel
          handleCancel={onCancel}
          isFieldsTouched={isTouched}
        />
      </Form>
      <div style={{ flex: '1 1 360px', minWidth: 320 }}>
        <Button
          style={{ marginBottom: 8 }}
          loading={isLocating}
          disabled={!address?.trim()}
          onClick={locateFromAddress}
        >
          Find from address
        </Button>
        <LocationMap
          latitude={pin.latitude}
          longitude={pin.longitude}
          focusToken={focusToken}
          onChange={(latitude, longitude) => {
            setPin({ latitude, longitude });
            setIsPinProtected(latitude != null);
            setIsTouched(true);
          }}
        />
      </div>
    </Flex>
  );
};

export default LocationMehfilDetails;
