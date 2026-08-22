import { Accounts } from 'meteor/accounts-base';

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
  return isExpired ? undefined : user;
};
