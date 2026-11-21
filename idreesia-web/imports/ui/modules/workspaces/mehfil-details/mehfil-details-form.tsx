import React, { useState } from 'react';
import { Button, Flex, Form } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import {
  CheckboxField,
  FormButtonsSaveCancel,
  InputTextAreaField,
  InputTextField,
} from '/imports/ui/modules/helpers/fields';

import { geocodeAddress } from './geocode-address';
import MehfilDetailsMap from './mehfil-details-map';

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

interface FormValues {
  address?: string;
  mehfilStartYear?: string;
  timingDetails?: string;
  lcdAvailability?: boolean;
  tabAvailability?: boolean;
  otherMehfilDetails?: string;
}

interface Pin {
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
  // Kept outside the form: the map is not a form field.
  const [pin, setPin] = useState<Pin>({
    latitude: details?.latitude ?? null,
    longitude: details?.longitude ?? null,
  });
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
        message.warning(
          'Could not find this address on the map. Click the map to place the pin.',
          5
        );
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
    if (!readOnly && !isPinProtected && !isLocating) locateFromAddress();
  };

  const handleFinish = (values: FormValues) => {
    onSubmit({
      address: values.address,
      mehfilStartYear: values.mehfilStartYear,
      timingDetails: values.timingDetails,
      lcdAvailability: !!values.lcdAvailability,
      tabAvailability: !!values.tabAvailability,
      otherMehfilDetails: values.otherMehfilDetails,
      latitude: pin.latitude ?? undefined,
      longitude: pin.longitude ?? undefined,
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
        <InputTextAreaField
          fieldName="address"
          fieldLabel="Address"
          onBlur={handleAddressBlur}
        />
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
              setIsTouched(false);
            }}
            isFieldsTouched={isTouched}
          />
        )}
      </Form>
      <div style={{ flex: '1 1 360px', minWidth: 320 }}>
        {readOnly ? null : (
          <Button
            style={{ marginBottom: 8 }}
            loading={isLocating}
            disabled={!address?.trim()}
            onClick={locateFromAddress}
          >
            Find from address
          </Button>
        )}
        <MehfilDetailsMap
          latitude={pin.latitude}
          longitude={pin.longitude}
          focusToken={focusToken}
          onChange={
            readOnly
              ? undefined
              : (latitude, longitude) => {
                  setPin({ latitude, longitude });
                  setIsPinProtected(latitude != null);
                  setIsTouched(true);
                }
          }
        />
      </div>
    </Flex>
  );
};

export default MehfilDetailsForm;
