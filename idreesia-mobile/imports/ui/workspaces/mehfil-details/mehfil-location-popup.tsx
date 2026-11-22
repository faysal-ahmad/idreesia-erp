import React, { useState } from 'react';
import { Button, Popup, TextArea } from 'antd-mobile';

import { showError, showInfo, showWarning } from '../../layout';
import { getCurrentLocation } from '../../utilities';
import { geocodeAddress } from './geocode-address';
import { MehfilDetailsMap } from './mehfil-details-map';

interface Pin {
  latitude: number | null;
  longitude: number | null;
}

interface Props {
  visible: boolean;
  /** The mehfil's address, to start the address lookup from. */
  address?: string | null;
  /** The form's current location, where the pin starts. */
  latitude?: number | null;
  longitude?: number | null;
  /** Takes the pin as the mehfil's location (the form saves it later). */
  onOk(latitude: number | null, longitude: number | null): void;
  onClose(): void;
}

// Kept apart from the Popup so its state starts afresh every time it opens
// (the Popup unmounts its content when closed).
const PopupBody = ({ address, latitude, longitude, onOk, onClose }: Omit<Props, 'visible'>) => {
  // Looking an address up here never changes the mehfil's saved address.
  const [searchAddress, setSearchAddress] = useState(address ?? '');
  const [pin, setPin] = useState<Pin>({ latitude: latitude ?? null, longitude: longitude ?? null });
  const [focusToken, setFocusToken] = useState(0);
  const [locating, setLocating] = useState(false);
  const [locatingMe, setLocatingMe] = useState(false);

  const locateFromAddress = async () => {
    const text = searchAddress.trim();
    if (!text) return;
    setLocating(true);
    try {
      const result = await geocodeAddress(text);
      if (!result) {
        showWarning('Could not find this address on the map. Tap the map to place the pin.');
        return;
      }
      setPin({ latitude: result.latitude, longitude: result.longitude });
      setFocusToken(token => token + 1);
      if (!result.isFullMatch) {
        showInfo(`Approximate location (matched "${result.matchedQuery}"). Drag the pin to adjust.`);
      }
    } catch (failure) {
      showError(failure, 'Could not look up the address.');
    } finally {
      setLocating(false);
    }
  };

  // Puts the pin where the user is standing; they can still drag it to adjust.
  const locateFromDevice = async () => {
    setLocatingMe(true);
    try {
      const { latitude: lat, longitude: lng } = await getCurrentLocation();
      setPin({ latitude: lat, longitude: lng });
      setFocusToken(token => token + 1);
    } catch (failure) {
      showError(failure, 'Could not find your location.');
    } finally {
      setLocatingMe(false);
    }
  };

  return (
    <>
      <div className="da-popup-header">
        <span className="da-popup-title">Set location</span>
        <button className="da-popup-done" type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
      <div className="mehfil-location-body">
        <TextArea
          autoSize={{ minRows: 2, maxRows: 4 }}
          placeholder="Address to look up"
          value={searchAddress}
          onChange={setSearchAddress}
        />
        <Button block disabled={!searchAddress.trim()} loading={locating} onClick={locateFromAddress}>
          Find from address
        </Button>
        <Button block loading={locatingMe} onClick={locateFromDevice}>
          Use my current location
        </Button>
        <MehfilDetailsMap
          focusToken={focusToken}
          latitude={pin.latitude}
          longitude={pin.longitude}
          onChange={(lat, lng) => setPin({ latitude: lat, longitude: lng })}
        />
      </div>
      <div className="da-popup-footer">
        <Button
          block
          color="primary"
          onClick={() => {
            onOk(pin.latitude, pin.longitude);
            onClose();
          }}
        >
          Save location
        </Button>
      </div>
    </>
  );
};

/**
 * Sets the mehfil's location: look an address up, use the device's current
 * location, or place the pin by hand.
 * Nothing is stored here: "Save location" only sets it in the form.
 */
export const MehfilLocationPopup = ({ visible, onClose, ...bodyProps }: Props) => (
  <Popup destroyOnClose bodyClassName="da-popup mehfil-location-popup" position="bottom" visible={visible}>
    <PopupBody {...bodyProps} onClose={onClose} />
  </Popup>
);
