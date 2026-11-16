import { describe, expect, it } from 'vitest';

import { Permissions } from 'meteor/idreesia-common/constants';
import {
  makeLockedUser,
  makeSuperAdmin,
  makeUser,
} from 'meteor/idreesia-common/server/test-utils/fixtures';

import { assertCanRemoveSalariesOfMonth } from './access';

const NOW = new Date(2026, 10, 16); // 16 Nov 2026
const THIS_MONTH = '01-11-2026';
const LAST_MONTH = '01-10-2026';
const NEXT_MONTH = '01-12-2026';

const manager = makeUser({ permissions: [Permissions.HR_MANAGE_EMPLOYEES] });
const deleter = makeUser({ permissions: [Permissions.HR_DELETE_DATA] });

describe('assertCanRemoveSalariesOfMonth', () => {
  it('lets a salary manager remove the current and future months', () => {
    expect(() => assertCanRemoveSalariesOfMonth(manager, THIS_MONTH, NOW)).not.toThrow();
    expect(() => assertCanRemoveSalariesOfMonth(manager, NEXT_MONTH, NOW)).not.toThrow();
  });

  it('needs HR_DELETE_DATA for past months', () => {
    expect(() => assertCanRemoveSalariesOfMonth(manager, LAST_MONTH, NOW)).toThrow(
      'past months'
    );
    expect(() => assertCanRemoveSalariesOfMonth(deleter, LAST_MONTH, NOW)).not.toThrow();
  });

  it('lets a super-admin remove any month', () => {
    expect(() => assertCanRemoveSalariesOfMonth(makeSuperAdmin(), LAST_MONTH, NOW)).not.toThrow();
  });

  it('refuses locked and missing users for past months', () => {
    expect(() =>
      assertCanRemoveSalariesOfMonth(makeLockedUser({ permissions: [Permissions.HR_DELETE_DATA] }), LAST_MONTH, NOW)
    ).toThrow();
    expect(() => assertCanRemoveSalariesOfMonth(undefined, LAST_MONTH, NOW)).toThrow();
  });
});
