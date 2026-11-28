import { Mongo } from 'meteor/mongo';

// Password-login attempts, one document per account and client address
// (business-logic/admin/users/login-attempts.ts). Written only by the login
// throttle, so no schema is attached. Expired by a TTL index on expiresAt
// (migration 2).
export interface LoginAttemptDocument {
  /** `${userId}|${clientAddress}`, so concurrent first attempts collide. */
  _id: string;
  userId: string;
  /** Normalized client address (an IPv6 address is reduced to its /56). */
  clientAddress: string;
  count: number;
  lastAttemptAt: Date;
  blockedUntil?: Date | null;
  /** Until when a successful login from this address exempts it from the account-wide cap. */
  trustedUntil?: Date | null;
  expiresAt: Date;
}

const LoginAttempts = new Mongo.Collection<LoginAttemptDocument>(
  'login-attempts'
);

export default LoginAttempts;
