import { Accounts } from 'meteor/accounts-base';
import { resolveEffectiveAccess } from 'meteor/idreesia-common/server/business-logic/admin/users/effective-access';

import { isAccountLocked } from './account-lock';

// Inlined from the (abandoned - last release was a beta in March 2024) meteor/apollo
// package, whose entire contents were this one function. Resolves the GraphQL
// request's Authorization header (a Meteor login token) to the Meteor user it
// belongs to, the same way meteor/apollo did.
interface AccountsPrivateApi {
  _hashLoginToken(loginToken: string): string;
  _tokenExpiration(when: Date): Date;
}
const AccountsPrivate = Accounts as unknown as AccountsPrivateApi;

interface MeteorUser {
  _id: string;
  locked?: boolean;
  permissions?: string[];
  instances?: string[];
  groups?: string[];
  services?: {
    resume?: {
      loginTokens?: Array<{ hashedToken: string; when: Date }>;
    };
  };
}

export const getUser = async (
  loginToken: string | undefined
): Promise<MeteorUser | undefined> => {
  if (!loginToken) return undefined;

  const hashedToken = AccountsPrivate._hashLoginToken(loginToken);
  const user: MeteorUser | undefined = await Meteor.users.findOneAsync({
    'services.resume.loginTokens.hashedToken': hashedToken,
  });
  if (!user) return undefined;

  const tokenInfo = user.services?.resume?.loginTokens?.find(
    token => token.hashedToken === hashedToken
  );
  if (!tokenInfo) return undefined;

  const isExpired = AccountsPrivate._tokenExpiration(tokenInfo.when) < new Date();
  // A token issued before the account was locked stops working too.
  if (isExpired || isAccountLocked(user)) return undefined;

  // Permissions and instances include those granted by the user's groups, so
  // every authorization check downstream sees the effective access.
  if (!user.groups?.length) return user;
  const { permissions, instances } = await resolveEffectiveAccess(user);
  return { ...user, permissions, instances };
};
