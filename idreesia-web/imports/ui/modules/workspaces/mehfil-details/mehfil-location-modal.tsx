import React, { useState } from 'react';
import { Button, Flex, Input, Modal } from 'antd';
import { message } from '/imports/ui/antd-feedback';

import { geocodeAddress } from './geocode-address';
import MehfilDetailsMap from './mehfil-details-map';

interface Pin {
  latitude: number | null;
  longitude: number | null;
}

interface Props {
  open: boolean;
  /** The mehfil's address, to start the address lookup from. */
  address?: string | null;
  /** The form's current location, where the pin starts. */
  latitude?: number | null;
  longitude?: number | null;
  /** Takes the pin as the mehfil's location (the form saves it later). */
  onOk(latitude: number | null, longitude: number | null): void;
  onClose(): void;
}

interface BodyProps extends Omit<Props, 'open'> {}

// Kept apart from the modal so its state starts afresh every time the modal
// opens (the modal unmounts its content when closed).
const ModalBody = ({ address, latitude, longitude, onOk, onClose }: BodyProps) => {
  // Looking an address up here never changes the mehfil's saved address.
  const [searchAddress, setSearchAddress] = useState(address ?? '');
  const [pin, setPin] = useState<Pin>({
    latitude: latitude ?? null,
    longitude: longitude ?? null,
  });
  const [focusToken, setFocusToken] = useState(0);
  const [isLocating, setIsLocating] = useState(false);

  const locateFromAddress = async () => {
    const text = searchAddress.trim();
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
      setFocusToken(token => token + 1);
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

  const handleOk = () => {
    onOk(pin.latitude, pin.longitude);
    onClose();
  };

  return (
    <>
      <Flex gap={8} align="flex-start" style={{ marginBottom: 12 }}>
        <Input.TextArea
          value={searchAddress}
          onChange={event => setSearchAddress(event.target.value)}
          placeholder="Address to look up"
          autoSize={{ minRows: 2, maxRows: 4 }}
        />
        <Button
          loading={isLocating}
          disabled={!searchAddress.trim()}
          onClick={locateFromAddress}
        >
          Find from address
        </Button>
      </Flex>
      <MehfilDetailsMap
        latitude={pin.latitude}
        longitude={pin.longitude}
        focusToken={focusToken}
        onChange={(lat, lng) => setPin({ latitude: lat, longitude: lng })}
      />
      <Flex justify="flex-end" gap={8} style={{ marginTop: 16 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" onClick={handleOk}>
          Ok
        </Button>
      </Flex>
    </>
  );
};

/**
 * Sets the mehfil's location: look an address up or place the pin by hand,
 * then Ok. Nothing is stored here: Ok only sets the location in the form.
 */
const MehfilLocationModal = ({ open, onClose, ...bodyProps }: Props) => (
  <Modal
    title="Set Mehfil Location"
    open={open}
    onCancel={onClose}
    footer={null}
    width={720}
    destroyOnHidden
    maskClosable={false}
  >
    <ModalBody {...bodyProps} onClose={onClose} />
  </Modal>
);

export default MehfilLocationModal;
