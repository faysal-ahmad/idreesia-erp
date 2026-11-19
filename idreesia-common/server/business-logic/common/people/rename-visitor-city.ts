import { GraphQLError } from 'graphql';

import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { CityLocationMappings } from 'meteor/idreesia-common/server/collections/admin';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';

interface UserRef {
  _id: string;
}

/**
 * Renames a free-text visitor city: every person whose visitor city is
 * `existingSpelling` gets `newSpelling` instead, and the city's location
 * mapping (if any) follows it, unless the new spelling already has one. A city
 * that exists in the Outstation cities list is managed there and cannot be
 * renamed here. Returns the number of people updated.
 */
export async function renameVisitorCity(
  existingSpelling: string,
  newSpelling: string,
  user: UserRef
): Promise<number> {
  const trimmed = newSpelling.trim();
  if (!trimmed) {
    throw new GraphQLError('The new city name cannot be empty.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }

  return runInTransaction(async () => {
    const outstationCity = await Cities.findOneAsync({
      name: existingSpelling,
    });
    if (outstationCity) {
      throw new GraphQLError(
        'Spellings for this city cannot be changed as it exists in the Outstation city list.',
        { extensions: { code: 'CONFLICT' } }
      );
    }

    const date = new Date();
    const count = await People.updateAsync(
      { 'visitorData.city': { $eq: existingSpelling } },
      {
        $set: {
          'visitorData.city': trimmed,
          updatedAt: date,
          updatedBy: user._id,
        },
      },
      { multi: true }
    );

    const mapping = await CityLocationMappings.findOneAsync({
      city: existingSpelling,
    });
    if (mapping && existingSpelling !== trimmed) {
      const target = await CityLocationMappings.findOneAsync({ city: trimmed });
      if (target) {
        await CityLocationMappings.removeAsync(mapping._id as string);
      } else {
        await CityLocationMappings.updateAsync(mapping._id as string, {
          $set: { city: trimmed, updatedAt: date, updatedBy: user._id },
        });
      }
    }

    return count;
  });
}
