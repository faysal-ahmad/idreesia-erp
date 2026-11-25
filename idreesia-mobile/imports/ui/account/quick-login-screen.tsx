import React, { useEffect, useState } from 'react';
import { Button, Dialog, Form, Input, List } from 'antd-mobile';
import { useMutation, useQuery } from '@apollo/client/react';
import { TRUSTED_DEVICE_PIN_LENGTH } from 'meteor/idreesia-common/constants';

import {
  clearStoredDevice,
  loadStoredDevice,
  saveStoredDevice,
  type StoredDevice,
} from '../auth/device-store';
import { getDeviceName } from '../auth/device-name';
import { PinInput } from '../components';
import {
  MOBILE_ENROLL_TRUSTED_DEVICE,
  MOBILE_MY_TRUSTED_DEVICES,
  MOBILE_REMOVE_TRUSTED_DEVICE,
} from '../gql';
import { useCurrentUser } from '../hooks';
import {
  Page,
  PageLoading,
  showError,
  showSuccess,
  showWarning,
} from '../layout';
import { AccountPaths } from './paths';

type Step = 'idle' | 'code' | 'enter' | 'confirm';

interface CodeFormValues {
  code: string;
}

const formatDate = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()}`;
};

/**
 * Quick login: lets the user sign in on this device with a 4-digit PIN
 * instead of their password, even after signing out. Also lists the user's
 * trusted devices so lost ones can be removed.
 */
export const QuickLoginScreen = () => {
  const { user, userLoading } = useCurrentUser();
  const [device, setDevice] = useState<StoredDevice | null | undefined>(undefined);
  const [step, setStep] = useState<Step>('idle');
  const [firstPin, setFirstPin] = useState('');
  const [pin, setPin] = useState('');
  // The authenticator code, asked for first when two-factor is on.
  const [code, setCode] = useState('');
  const [form] = Form.useForm<CodeFormValues>();

  const { data, refetch } = useQuery(MOBILE_MY_TRUSTED_DEVICES, {
    fetchPolicy: 'cache-and-network',
  });
  const [enroll, { loading: enrolling }] = useMutation(MOBILE_ENROLL_TRUSTED_DEVICE);
  const [removeDevice] = useMutation(MOBILE_REMOVE_TRUSTED_DEVICE);

  const twoFactor = user?.twoFactorEnabled === true;
  const devices = data?.myTrustedDevices ?? [];
  // This device is trusted only while the server still lists it.
  const isThisDeviceTrusted =
    !!device && devices.some(listed => listed?._id === device.deviceId);

  useEffect(() => {
    loadStoredDevice()
      .then(setDevice)
      .catch(() => setDevice(null));
  }, []);

  const reset = () => {
    setStep('idle');
    setFirstPin('');
    setPin('');
    setCode('');
    form.resetFields();
  };

  const handleStart = () => setStep(twoFactor ? 'code' : 'enter');

  const handleCodeFinish = ({ code: entered }: CodeFormValues) => {
    setCode(entered.trim());
    setStep('enter');
  };

  const handleEnterFilled = (value: string) => {
    setFirstPin(value);
    setPin('');
    setStep('confirm');
  };

  const handleConfirmFilled = async (value: string) => {
    if (value !== firstPin) {
      showWarning('The PINs do not match. Please try again.');
      setFirstPin('');
      setPin('');
      setStep('enter');
      return;
    }

    try {
      const { data: result } = await enroll({
        variables: {
          pin: value,
          name: getDeviceName(),
          code: twoFactor ? code : undefined,
          replaceDeviceId: device?.deviceId,
        },
      });
      const enrolled = result?.enrollTrustedDevice;
      if (!enrolled) throw new Error('The server did not return a device.');

      await saveStoredDevice({
        deviceId: enrolled.deviceId,
        secret: enrolled.deviceSecret,
        label: user?.displayName ?? user?.username ?? '',
      });
      setDevice(await loadStoredDevice());
      await refetch();
      showSuccess('Quick login is on for this device.');
      reset();
    } catch (error) {
      showError(error, 'Could not turn on quick login.');
      reset();
    }
  };

  const handleTurnOff = async () => {
    const confirmed = await Dialog.confirm({
      content: 'Turn off quick login on this device? You will sign in with your password.',
      confirmText: 'Turn off',
      cancelText: 'Cancel',
    });
    if (!confirmed || !device) return;

    try {
      await removeDevice({ variables: { deviceId: device.deviceId } });
    } catch (error) {
      // The server may already have forgotten the device; this one is
      // being turned off either way.
      showError(error, 'Could not remove the device from the server.');
    }
    await clearStoredDevice();
    setDevice(null);
    await refetch().catch(() => undefined);
  };

  const handleRemoveOther = async (deviceId: string, name?: string | null) => {
    const confirmed = await Dialog.confirm({
      content: `Remove ${name || 'this device'}? It will need your password to sign in again.`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
    });
    if (!confirmed) return;

    try {
      await removeDevice({ variables: { deviceId } });
      await refetch();
    } catch (error) {
      showError(error, 'Could not remove the device.');
    }
  };

  let content: React.ReactNode;
  if ((userLoading && !user) || device === undefined) {
    content = <PageLoading />;
  } else if (step !== 'idle') {
    content = (
      <>
        {step === 'code' ? (
          <>
            <Form
              form={form}
              layout="vertical"
              mode="card"
              onFinish={handleCodeFinish}
              footer={
                <Button block color="primary" size="large" type="submit">
                  Continue
                </Button>
              }
            >
              <Form.Header>
                Enter the current 6-digit code from your authenticator app. Wait for a
                new code if you just used one to sign in.
              </Form.Header>
              <Form.Item
                label="Verification code"
                name="code"
                rules={[{ required: true, message: 'Please enter the verification code.' }]}
              >
                <Input autoFocus autoComplete="one-time-code" inputMode="numeric" maxLength={6} clearable />
              </Form.Item>
            </Form>
            <div className="two-factor-actions">
              <Button block fill="none" onClick={reset}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
        <>
        <p className="pin-setup-label">
          {step === 'enter'
            ? `Choose a ${TRUSTED_DEVICE_PIN_LENGTH}-digit PIN.`
            : 'Enter the PIN again to confirm.'}
        </p>
        <div className="pin-setup-input">
          <PinInput
            key={step}
            autoFocus
            value={pin}
            onChange={setPin}
            onFill={step === 'enter' ? handleEnterFilled : handleConfirmFilled}
          />
        </div>
        <div className="two-factor-actions">
          <Button block disabled={enrolling} fill="none" onClick={reset}>
            Cancel
          </Button>
        </div>
        </>
        )}
      </>
    );
  } else {
    content = (
      <>
        <p className="page-hint">
          {isThisDeviceTrusted
            ? 'Quick login is on for this device. After signing out, enter your PIN instead of your password. Five wrong PINs turn it off.'
            : `Sign in on this device with a ${TRUSTED_DEVICE_PIN_LENGTH}-digit PIN instead of your password, even after signing out. Only turn it on for a device that is yours.`}
        </p>
        <div className="two-factor-actions">
          <Button
            block
            color="primary"
            size="large"
            onClick={handleStart}
          >
            {isThisDeviceTrusted ? 'Change PIN' : 'Turn on quick login'}
          </Button>
          {isThisDeviceTrusted && (
            <Button block color="danger" fill="outline" size="large" onClick={handleTurnOff}>
              Turn off
            </Button>
          )}
        </div>

        {devices.length > 0 && (
          <List header="Trusted devices" mode="card">
            {devices.map(listed => {
              if (!listed) return null;
              const isThis = listed._id === device?.deviceId;
              return (
                <List.Item
                  key={listed._id}
                  arrowIcon={false}
                  description={
                    listed.lastUsedAt
                      ? `Last used ${formatDate(listed.lastUsedAt)}`
                      : `Added ${formatDate(listed.createdAt)}`
                  }
                  extra={
                    isThis ? (
                      'This device'
                    ) : (
                      <span className="two-factor-danger-text">Remove</span>
                    )
                  }
                  onClick={isThis ? undefined : () => handleRemoveOther(listed._id!, listed.name)}
                >
                  {listed.name || 'Device'}
                </List.Item>
              );
            })}
          </List>
        )}
      </>
    );
  }

  return (
    <Page backTo={AccountPaths.account} title="Quick login">
      {content}
    </Page>
  );
};
