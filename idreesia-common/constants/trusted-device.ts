// Trusted-device PIN login (business-logic/admin/users/trusted-devices.ts).

/** Digits in a trusted-device PIN. Any combination of digits is accepted. */
export const TRUSTED_DEVICE_PIN_LENGTH = 4;

// Meteor.Error codes (error.error) of the trusted-device login. The reason
// text is deliberately vague, so clients match on these codes.
export const TrustedDeviceErrorCode = {
  // The PIN was wrong. The device is still trusted, until too many wrong
  // PINs revoke it.
  INVALID_PIN: 'invalid-pin',
  // The device is unknown, removed, expired or revoked. The client forgets
  // it and asks for the password.
  DEVICE_NOT_TRUSTED: 'device-not-trusted',
} as const;
