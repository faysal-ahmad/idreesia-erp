// Shared, dependency-free fixtures for authorization tests.

export interface TestUser {
  _id: string;
  username?: string;
  locked?: boolean;
  isSuperAdmin?: boolean;
  permissions?: string[];
  groups?: string[];
  personId?: string;
}

export const makeUser = (overrides: Partial<TestUser> = {}): TestUser => ({
  _id: 'u1',
  username: 'user1',
  permissions: [],
  ...overrides,
});

export const makeSuperAdmin = (overrides: Partial<TestUser> = {}): TestUser =>
  makeUser({ _id: 'sa1', isSuperAdmin: true, ...overrides });

export const makeLockedUser = (overrides: Partial<TestUser> = {}): TestUser =>
  makeUser({ locked: true, ...overrides });

// A GraphQL execution context, as built by the server (user only).
export const gqlContext = (user?: TestUser | null) => ({ user });
