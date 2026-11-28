import { Mongo } from 'meteor/mongo';

// Devices a user has enrolled for PIN login
// (business-logic/admin/users/trusted-devices.ts). Written only by that
// module, so no schema is attached. Expired by a TTL index on removeAt
// (migration 2), which keeps revoked devices around for a while for the
// security log's sake.
export interface TrustedDeviceDocument {
  /** The device id: random and unguessable, the client sends it to log in. */
  _id: string;
  userId: string;
  /** What the user called the device, e.g. "Pixel 8". */
  name?: string | null;
  /** scrypt of the device secret and the PIN, so neither can be guessed alone. */
  salt: string;
  hash: string;
  /** Fingerprint of the user's password when enrolled; a new password revokes the device. */
  passwordFingerprint: string | null;
  /** Wrong PINs since the last good login. */
  failedPinAttempts: number;
  createdAt: Date;
  lastUsedAt?: Date | null;
  expiresAt: Date;
  revokedAt?: Date | null;
  /** Why the device stopped being trusted. */
  revokedReason?: string | null;
  /** When the document is deleted: after it expires or is revoked. */
  removeAt: Date;
}

const TrustedDevices = new Mongo.Collection<TrustedDeviceDocument>(
  'trusted-devices'
);

export default TrustedDevices;
