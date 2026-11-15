import { Accounts } from 'meteor/accounts-base';

/**
 * The Authorization header the ERP's REST endpoints (and GraphQL) expect: the
 * current Meteor login token.
 */
export default function getLoginHeaders(): Record<string, string> {
  return {
    authorization: (Accounts as any)._storedLoginToken() ?? '',
  };
}
