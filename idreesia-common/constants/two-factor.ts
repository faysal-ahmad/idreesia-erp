// Meteor.Error codes (error.error) the accounts-2fa password login and the
// REST /login endpoint use. The reason text is deliberately vague, so clients
// match on these codes.
export const TwoFactorErrorCode = {
  // Password was right but the account needs a code from the authenticator app.
  CODE_REQUIRED: 'no-2fa-code',
  // The code from the authenticator app was wrong or expired.
  INVALID_CODE: 'invalid-2fa-code',
  // A password reset or email verification succeeded, but the user isn't
  // logged in automatically because two-factor is on.
  LOGIN_SKIPPED: '2fa-enabled',
} as const;
