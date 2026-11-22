import React, { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { EnvironmentOutlined } from '@ant-design/icons';
import { Button, Flex, Form, Input, Space, Tooltip } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { ATTENDANCE_GEOFENCE_METERS } from 'meteor/idreesia-common/constants/duties-attendance';
import type { OrgLocationByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { FormButtonsSaveCancel, SelectField } from '/imports/ui/modules/helpers/fields';

import { UPDATE_ORG_LOCATION } from './gql';
import { toMehfilDetails } from './helpers';
import LocationMap from './location-map';
import LocationPinModal from './location-pin-modal';
import { MehfilDetailsFields, type LocationFormValues } from './location-form';

const GEOFENCE_OPTIONS = [
  { value: 0, label: 'None' },
  ...ATTENDANCE_GEOFENCE_METERS.map(meters => ({
    value: meters,
    label: `${meters} meters`,
  })),
];

type OrgLocation = NonNullable<OrgLocationByIdQuery['orgLocationById']>;

interface Pin {
  latitude: number | null;
  longitude: number | null;
}

interface Props {
  orgLocation: OrgLocation;
  onCancel(): void;
}

/**
 * The Mehfil Details tab: the form on the left, the map beside it. The
 * location is set from a modal (address lookup or a hand-placed pin); Ok puts
 * it in the form and Save stores it with the other fields.
 */
const LocationMehfilDetails = ({ orgLocation, onCancel }: Props) => {
  const details = orgLocation.mehfilDetails;
  const [isTouched, setIsTouched] = useState(false);
  // The location in the form: kept outside it, the map is not a form field.
  const [pin, setPin] = useState<Pin>({
    latitude: details?.latitude ?? null,
    longitude: details?.longitude ?? null,
  });
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const [form] = Form.useForm<LocationFormValues>();
  const address = Form.useWatch('address', form);

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

  // Takes the location chosen in the modal into the form; Save stores it.
  const handlePinOk = (latitude: number | null, longitude: number | null) => {
    if (latitude !== pin.latitude || longitude !== pin.longitude) {
      setPin({ latitude, longitude });
      // Geofencing checks against the location, so it goes off with it.
      if (latitude == null || longitude == null) {
        form.setFieldValue('attendanceGeofenceMeters', 0);
      }
      setIsTouched(true);
    }
  };

  const hasPin = pin.latitude != null && pin.longitude != null;

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
          attendanceGeofenceMeters: details?.attendanceGeofenceMeters ?? 0,
        }}
        onFieldsChange={() => setIsTouched(true)}
        onFinish={handleFinish}
      >
        <MehfilDetailsFields
          afterAddress={
            <>
            {/* Not a form field: set from the modal, stored by Save. */}
            <Form.Item
              label="Coordinates"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 14 }}
            >
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  readOnly
                  value={
                    hasPin
                      ? `${pin.latitude!.toFixed(6)}, ${pin.longitude!.toFixed(6)}`
                      : ''
                  }
                />
                <Tooltip title="Set location">
                  <Button
                    icon={<EnvironmentOutlined />}
                    onClick={() => setIsPinModalOpen(true)}
                  />
                </Tooltip>
              </Space.Compact>
            </Form.Item>
            <SelectField
              fieldName="attendanceGeofenceMeters"
              fieldLabel="Attendance Geofencing"
              allowClear={false}
              initialValue={details?.attendanceGeofenceMeters ?? 0}
              data={GEOFENCE_OPTIONS}
              getDataValue={option => option.value}
              getDataText={option => option.label}
              disabled={!hasPin}
            />
            </>
          }
        />
        <FormButtonsSaveCancel
          handleCancel={onCancel}
          isFieldsTouched={isTouched}
        />
      </Form>
      {hasPin ? (
        <div style={{ flex: '1 1 360px', minWidth: 320 }}>
          <LocationMap
            key={`${pin.latitude},${pin.longitude}`}
            latitude={pin.latitude}
            longitude={pin.longitude}
          />
        </div>
      ) : null}
      <LocationPinModal
        open={isPinModalOpen}
        address={address}
        latitude={pin.latitude}
        longitude={pin.longitude}
        onOk={handlePinOk}
        onClose={() => setIsPinModalOpen(false)}
      />
    </Flex>
  );
};

export default LocationMehfilDetails;
