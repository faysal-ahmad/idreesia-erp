import React, { useState } from 'react';
import { Button } from 'antd-mobile';
import { useMutation } from '@apollo/client/react';
import { TrustedDeviceErrorCode } from 'meteor/idreesia-common/constants';

import { AuthLayout, PinInput } from '../../components';
import { MOBILE_UPDATE_LOGIN_TIME } from '../../gql';
import { showError } from '../../layout';
import { getErrorCode, loginWithTrustedDevice } from '../accounts';
import { clearStoredDevice, type StoredDevice } from '../device-store';

interface Props {
  device: StoredDevice;
  /** The user chose the password instead. */
  onUsePassword: () => void;
  /** The server no longer trusts the device; its credential has been forgotten. */
  onDeviceLost: () => void;
}

/**
 * The sign-in screen of a device the user turned quick login on for: the PIN
 * alone signs them in, even after signing out.
 */
export const PinLoginScreen = ({ device, onUsePassword, onDeviceLost }: Props) => {
  const [pin, setPin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [wrongPin, setWrongPin] = useState(false);
  const [updateLoginTime] = useMutation(MOBILE_UPDATE_LOGIN_TIME);

  const signIn = async (value: string) => {
    if (submitting) return;
    setSubmitting(true);
    setWrongPin(false);
    try {
      await loginWithTrustedDevice(device, value);
      // Not awaited: signing in shouldn't fail if this bookkeeping call does.
      updateLoginTime().catch(() => undefined);
    } catch (error) {
      setSubmitting(false);
      setPin('');
      const code = getErrorCode(error);
      if (code === TrustedDeviceErrorCode.DEVICE_NOT_TRUSTED) {
        await clearStoredDevice();
        showError(error, 'Quick login was turned off.');
        onDeviceLost();
      } else if (code === TrustedDeviceErrorCode.INVALID_PIN) {
        setWrongPin(true);
        showError(error, 'Incorrect PIN.');
      } else {
        showError(error, 'Could not sign in.');
      }
    }
  };

  return (
    <AuthLayout
      subtitle="Enter your PIN to sign in."
      title={device.label ? `Welcome back, ${device.label}` : 'Welcome back'}
      footer={
        <Button fill="none" onClick={onUsePassword}>
          Use password instead
        </Button>
      }
    >
      <div className="pin-login-input">
        <PinInput
          autoFocus
          error={wrongPin}
          value={pin}
          onChange={value => {
            setPin(value);
            if (wrongPin) setWrongPin(false);
          }}
          onFill={signIn}
        />
      </div>
    </AuthLayout>
  );
};
