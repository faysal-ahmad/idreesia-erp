import React, { useEffect, useRef } from 'react';
import { NumberKeyboard, PasscodeInput, type PasscodeInputRef } from 'antd-mobile';
import { TRUSTED_DEVICE_PIN_LENGTH } from 'meteor/idreesia-common/constants';

interface Props {
  value: string;
  onChange: (value: string) => void;
  /** Called once all the digits are in. */
  onFill?: (value: string) => void;
  error?: boolean;
  /** Opens the number keyboard as soon as the input is shown. */
  autoFocus?: boolean;
}

/** The PIN of the trusted-device login: dots, with antd-mobile's number keyboard. */
export const PinInput = ({ value, onChange, onFill, error, autoFocus }: Props) => {
  const ref = useRef<PasscodeInputRef>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  return (
    <PasscodeInput
      ref={ref}
      className="pin-input"
      error={error}
      keyboard={<NumberKeyboard />}
      length={TRUSTED_DEVICE_PIN_LENGTH}
      seperated
      value={value}
      onChange={onChange}
      onFill={onFill}
    />
  );
};
