/**
 * Raised when a push from the security server cannot be applied. The REST
 * layer turns `statusCode` into the HTTP response status.
 */
export class SecurityServerSyncError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'SecurityServerSyncError';
    this.statusCode = statusCode;
  }
}
