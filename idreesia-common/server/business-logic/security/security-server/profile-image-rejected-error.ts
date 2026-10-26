/**
 * Raised when a profile image fails the face quality gate. The message is the
 * user-facing reason.
 */
export class ProfileImageRejectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProfileImageRejectedError';
  }
}
