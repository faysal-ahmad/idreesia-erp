// Self-registration is anonymous, so there is no account to keep a count on.
// It is limited per client address instead, in this process's memory: each
// web instance allows its own REGISTRATIONS_PER_WINDOW, and a restart resets
// the count. That is enough to stop a script creating accounts and sending
// enrollment emails in bulk; registrations are rare and need an
// administrator's approval anyway.
export const REGISTRATIONS_PER_WINDOW = 5;
export const REGISTRATION_WINDOW_MS = 60 * 60 * 1000;

const registrationsByAddress = new Map<
  string,
  { count: number; windowStart: number }
>();

/** Counts a registration from the address; false once over the limit. */
export function allowRegistration(address: string, now = Date.now()) {
  // Drop finished windows so the map can't grow without bound.
  registrationsByAddress.forEach((entry, key) => {
    if (now - entry.windowStart >= REGISTRATION_WINDOW_MS) {
      registrationsByAddress.delete(key);
    }
  });

  const entry = registrationsByAddress.get(address);
  if (!entry) {
    registrationsByAddress.set(address, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= REGISTRATIONS_PER_WINDOW) return false;
  entry.count += 1;
  return true;
}

/** For tests. */
export const resetRegistrationLimits = () => registrationsByAddress.clear();
