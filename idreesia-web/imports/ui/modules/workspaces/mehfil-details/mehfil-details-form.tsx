import React, { useState } from 'react';
import { EnvironmentOutlined } from '@ant-design/icons';
import { Button, Flex, Form, Input, Space, Tooltip } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import {
  CheckboxField,
  FormButtonsSaveCancel,
  InputTextAreaField,
  InputTextField,
} from '/imports/ui/modules/helpers/fields';

import MehfilDetailsMap from './mehfil-details-map';
import MehfilLocationModal from './mehfil-location-modal';

export interface MehfilDetailsValue {
  address?: string | null;
  mehfilStartYear?: string | null;
  timingDetails?: string | null;
  lcdAvailability?: boolean | null;
  tabAvailability?: boolean | null;
  otherMehfilDetails?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

// Only the fields the input type has: the query result also carries
// `__typename`, which the server rejects.
const pickDetails = (details?: MehfilDetailsValue | null): MehfilDetailsValue => ({
  address: details?.address,
  mehfilStartYear: details?.mehfilStartYear,
  timingDetails: details?.timingDetails,
  lcdAvailability: details?.lcdAvailability,
  tabAvailability: details?.tabAvailability,
  otherMehfilDetails: details?.otherMehfilDetails,
  latitude: details?.latitude,
  longitude: details?.longitude,
});

interface FormValues {
  address?: string;
  mehfilStartYear?: string;
  timingDetails?: string;
  lcdAvailability?: boolean;
  tabAvailability?: boolean;
  otherMehfilDetails?: string;
}

interface Location {
  latitude: number | null;
  longitude: number | null;
}

interface Props {
  details?: MehfilDetailsValue | null;
  /** Saves the details. */
  onSubmit(details: MehfilDetailsValue): Promise<unknown>;
  /** Shows the details without letting them be changed. */
  readOnly?: boolean;
}

/** The mehfil's details: the form on the left, the map beside it. */
const MehfilDetailsForm = ({ details, onSubmit, readOnly = false }: Props) => {
  const [form] = Form.useForm<FormValues>();
  const address = Form.useWatch('address', form);
  const [isTouched, setIsTouched] = useState(false);
  // What is stored, kept to reset the form to.
  const [saved, setSaved] = useState<MehfilDetailsValue>(
    pickDetails(details)
  );
  // The location in the form. Set from the location modal; stored by Save
  // with the other fields.
  const [location, setLocation] = useState<Location>({
    latitude: details?.latitude ?? null,
    longitude: details?.longitude ?? null,
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const handleFinish = (values: FormValues) => {
    const next: MehfilDetailsValue = {
      address: values.address,
      mehfilStartYear: values.mehfilStartYear,
      timingDetails: values.timingDetails,
      lcdAvailability: !!values.lcdAvailability,
      tabAvailability: !!values.tabAvailability,
      otherMehfilDetails: values.otherMehfilDetails,
      latitude: location.latitude ?? undefined,
      longitude: location.longitude ?? undefined,
    };
    onSubmit(next)
      .then(() => {
        setSaved(next);
        message.success('Mehfil details saved', 2);
        setIsTouched(false);
      })
      .catch((error: Error) => {
        message.error(error.message, 5);
      });
  };

  // Takes the location chosen in the modal into the form; Save stores it.
  const handleLocationOk = (
    latitude: number | null,
    longitude: number | null
  ) => {
    if (latitude !== location.latitude || longitude !== location.longitude) {
      setLocation({ latitude, longitude });
      setIsTouched(true);
    }
  };

  return (
    <Flex gap={24} wrap align="flex-start">
      <Form
        form={form}
        layout="horizontal"
        disabled={readOnly}
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
        <InputTextAreaField fieldName="address" fieldLabel="Address" />
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
                location.latitude != null && location.longitude != null
                  ? `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`
                  : ''
              }
            />
            {readOnly ? null : (
              <Tooltip title="Set location">
                <Button
                  icon={<EnvironmentOutlined />}
                  onClick={() => setIsLocationModalOpen(true)}
                />
              </Tooltip>
            )}
          </Space.Compact>
        </Form.Item>
        <InputTextField fieldName="mehfilStartYear" fieldLabel="Start Year" />
        <InputTextAreaField
          fieldName="timingDetails"
          fieldLabel="Timing Details"
        />
        <CheckboxField fieldName="lcdAvailability" fieldLabel="LCD Available" />
        <CheckboxField fieldName="tabAvailability" fieldLabel="Tab Available" />
        <InputTextAreaField
          fieldName="otherMehfilDetails"
          fieldLabel="Other Details"
        />
        {readOnly ? null : (
          <FormButtonsSaveCancel
            handleCancel={() => {
              form.resetFields();
              setLocation({
                latitude: saved.latitude ?? null,
                longitude: saved.longitude ?? null,
              });
              setIsTouched(false);
            }}
            isFieldsTouched={isTouched}
          />
        )}
      </Form>
      {location.latitude != null && location.longitude != null ? (
        <div style={{ flex: '1 1 360px', minWidth: 320 }}>
          <MehfilDetailsMap
            key={`${location.latitude},${location.longitude}`}
            latitude={location.latitude}
            longitude={location.longitude}
          />
        </div>
      ) : null}
      {readOnly ? null : (
        <MehfilLocationModal
          open={isLocationModalOpen}
          address={address}
          latitude={location.latitude}
          longitude={location.longitude}
          onOk={handleLocationOk}
          onClose={() => setIsLocationModalOpen(false)}
        />
      )}
    </Flex>
  );
};

export default MehfilDetailsForm;
