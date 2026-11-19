import { beforeEach, describe, expect, it } from 'vitest';

import {
  allowRegistration,
  REGISTRATION_WINDOW_MS,
  REGISTRATIONS_PER_WINDOW,
  resetRegistrationLimits,
} from './registration-limit';

describe('allowRegistration', () => {
  beforeEach(() => resetRegistrationLimits());

  it('limits registrations per address within the window', () => {
    for (let i = 0; i < REGISTRATIONS_PER_WINDOW; i += 1) {
      expect(allowRegistration('1.2.3.4', 0)).toBe(true);
    }
    expect(allowRegistration('1.2.3.4', 1000)).toBe(false);
    expect(allowRegistration('5.6.7.8', 1000)).toBe(true);
    expect(allowRegistration('1.2.3.4', REGISTRATION_WINDOW_MS)).toBe(true);
  });
});
