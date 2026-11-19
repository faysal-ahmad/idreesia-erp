import { GraphQLError } from 'graphql';

import { People } from 'meteor/idreesia-common/server/collections/common';

interface UserRef {
  _id: string;
}

/**
 * Renames a free-text visitor country: every person whose visitor country is
 * `existingSpelling` gets `newSpelling` instead. Returns the number of people
 * updated.
 */
export async function renameVisitorCountry(
  existingSpelling: string,
  newSpelling: string,
  user: UserRef
): Promise<number> {
  const trimmed = newSpelling.trim();
  if (!trimmed) {
    throw new GraphQLError('The new country name cannot be empty.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  return People.updateAsync(
    { 'visitorData.country': { $eq: existingSpelling } },
    {
      $set: {
        'visitorData.country': trimmed,
        updatedAt: new Date(),
        updatedBy: user._id,
      },
    },
    { multi: true }
  );
}
