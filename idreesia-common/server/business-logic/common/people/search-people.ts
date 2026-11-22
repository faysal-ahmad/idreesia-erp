import { add, endOfDay, endOfMonth, startOfDay, startOfMonth } from 'date-fns';
import { Formats } from 'meteor/idreesia-common/constants';
import { BloodGroups } from 'meteor/idreesia-common/constants/hr';
import {
  People,
  type PersonDocument,
} from 'meteor/idreesia-common/server/collections/common';
import {
  DutyTeamAssignments,
  Teams,
} from 'meteor/idreesia-common/server/collections/hr';
import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';
import { get, isNil } from 'meteor/idreesia-common/utilities/lodash';
import { parseDate } from 'meteor/idreesia-common/utilities/date-fns';

type LooseRecord = Record<string, any>;

export interface SearchPeopleFlags {
  includeKarkuns?: boolean;
  includeEmployees?: boolean;
  includeVisitors?: boolean;
  paginatedResults?: boolean;
  onlyDeleted?: boolean;
}

interface CountResult {
  total: number;
}

export async function buildPeopleSearchPipeline(
  params: LooseRecord = {},
  flags: SearchPeopleFlags = {}
) {
  const pipeline: LooseRecord[] = [];
  // A $text match is only allowed in the pipeline's first stage, so the
  // name search goes into this one rather than a stage of its own.
  pipeline.push({
    $match: {
      deletedAt: { $exists: Boolean(flags.onlyDeleted) },
      ...(params.name ? { $text: { $search: params.name } } : {}),
    },
  });

  const includeKarkuns = isNil(flags.includeKarkuns)
    ? false
    : flags.includeKarkuns;
  const includeVisitors = isNil(flags.includeVisitors)
    ? false
    : flags.includeVisitors;

  const {
    cnicNumber,
    phoneNumber,
    phoneNumbers,
    bloodGroup,
    ehadDate,
    ehadMonth,
    ehadDuration,
    dataSource,
    updatedBetween,
    tagId,
    // visitor related fields
    city,
    cityNames,
    additionalInfo,
    // karkun related fields
    lastTarteeb,
    dutyId,
    dutyIds,
    dutyShiftId,
    ehadKarkun,
    cityLocationId,
    cityLocationIds,
    mehfilLocationId,
    locationIds,
    region,
    // employee related fields
    jobId,
    jobIds,
    // user account related fileds
    userAccount,
  } = params;

  // ************************************
  // Add criteria for shared data fields
  // (name is matched in the first stage above)
  // ************************************
  if (cnicNumber) {
    pipeline.push({
      $match: {
        'sharedData.cnicNumber': { $eq: cnicNumber },
      },
    });
  }

  if (phoneNumber) {
    pipeline.push({
      $match: {
        $or: [
          { 'sharedData.contactNumber1': phoneNumber },
          { 'sharedData.contactNumber2': phoneNumber },
        ],
      },
    });
  } else if (phoneNumbers) {
    pipeline.push({
      $match: {
        $or: [
          { 'sharedData.contactNumber1': { $in: phoneNumbers } },
          { 'sharedData.contactNumber2': { $in: phoneNumbers } },
        ],
      },
    });
  }

  if (bloodGroup) {
    const convertedBloodGroupValue =
      BloodGroups[bloodGroup as keyof typeof BloodGroups];
    pipeline.push({
      $match: {
        'sharedData.bloodGroup': { $eq: convertedBloodGroupValue },
      },
    });
  }

  if (ehadDate) {
    pipeline.push({
      $match: {
        'sharedData.ehadDate': {
          $eq: startOfDay(parseDate(ehadDate, Formats.DATE_FORMAT)),
        },
      },
    });
  }

  if (ehadMonth) {
    pipeline.push({
      $match: {
        'sharedData.ehadDate': {
          $gte: startOfMonth(parseDate(ehadMonth, Formats.MONTH_FORMAT)),
        },
      },
    });
    pipeline.push({
      $match: {
        'sharedData.ehadDate': {
          $lte: endOfMonth(parseDate(ehadMonth, Formats.MONTH_FORMAT)),
        },
      },
    });
  }

  if (ehadDuration) {
    const { scale, duration } = JSON.parse(ehadDuration);
    if (duration) {
      const date = add(startOfDay(new Date()), { [scale]: -duration });

      pipeline.push({
        $match: {
          'sharedData.ehadDate': {
            $gte: date,
          },
        },
      });
    }
  }

  if (dataSource) {
    pipeline.push({
      $match: {
        dataSource: { $regex: new RegExp(`^${dataSource}`, 'i') },
      },
    });
  }

  if (tagId) {
    pipeline.push({
      $match: {
        'sharedData.tagIds': { $eq: tagId },
      },
    });
  }

  if (updatedBetween) {
    const updatedBetweenDates = JSON.parse(updatedBetween);

    if (updatedBetweenDates[0]) {
      pipeline.push({
        $match: {
          updatedAt: {
            $gte: startOfDay(
              parseDate(updatedBetweenDates[0], Formats.DATE_FORMAT)
            ),
          },
        },
      });
    }
    if (updatedBetweenDates[1]) {
      pipeline.push({
        $match: {
          updatedAt: {
            $lte: endOfDay(
              parseDate(updatedBetweenDates[1], Formats.DATE_FORMAT)
            ),
          },
        },
      });
    }
  }

  // ************************************
  // Add criteria for visitor data fields
  // ************************************
  if (includeVisitors) {
    if (city) {
      pipeline.push({
        $match: {
          'visitorData.city': { $eq: city },
        },
      });
    } else if (cityNames) {
      pipeline.push({
        $match: {
          'visitorData.city': { $in: cityNames },
        },
      });
    }

    if (additionalInfo) {
      if (additionalInfo === 'has-notes') {
        pipeline.push({
          $match: {
            'visitorData.otherNotes': { $exists: true, $nin: ['', null] },
          },
        });
      } else if (additionalInfo === 'has-criminal-record') {
        pipeline.push({
          $match: {
            'visitorData.criminalRecord': { $exists: true, $nin: ['', null] },
          },
        });
      } else if (additionalInfo === 'has-notes-or-criminal-record') {
        pipeline.push({
          $match: {
            $or: [
              {
                'visitorData.otherNotes': { $exists: true, $nin: ['', null] },
              },
              {
                'visitorData.criminalRecord': {
                  $exists: true,
                  $nin: ['', null],
                },
              },
            ],
          },
        });
      }
    }
  }

  // ************************************
  // Add criteria for karkun data fields
  // ************************************
  if (includeKarkuns) {
    if (ehadKarkun) {
      const ehadKarkunValue = ehadKarkun === 'true';
      pipeline.push({
        $match: {
          'karkunData.ehadKarkun': { $eq: ehadKarkunValue },
        },
      });
    }

    if (lastTarteeb) {
      const { scale, duration } = JSON.parse(lastTarteeb);
      if (duration) {
        const date = add(startOfDay(new Date()), { [scale]: -duration });

        pipeline.push({
          $match: {
            $or: [
              { 'karkunData.lastTarteebDate': { $exists: false } },
              {
                'karkunData.lastTarteebDate': { $lte: date },
              },
            ],
          },
        });
      }
    }

    if (cityLocationId) {
      pipeline.push({
        $match: {
          'karkunData.cityLocationId': { $eq: cityLocationId },
        },
      });
    } else if (cityLocationIds) {
      pipeline.push({
        $match: {
          'karkunData.cityLocationId': { $in: cityLocationIds },
        },
      });
    } else if (region) {
      // A region is the zone group location ("Zone <region>"); its cities are
      // the city locations anywhere below it.
      const zones = await OrgLocations.find({
        type: OrgLocationTypes.GROUP,
        name: `Zone ${region}`,
      }).fetchAsync();
      const regionCities = await OrgLocations.find({
        type: OrgLocationTypes.CITY,
        allParentIds: { $in: zones.map(zone => zone._id as string) },
      }).fetchAsync();
      pipeline.push({
        $match: {
          'karkunData.cityLocationId': {
            $in: regionCities.map(city => city._id as string),
          },
        },
      });
    }

    if (mehfilLocationId) {
      pipeline.push({
        $match: {
          'karkunData.mehfilLocationId': { $eq: mehfilLocationId },
        },
      });
    }

    // Karkuns of any of these locations, by their mehfil or their city.
    if (locationIds) {
      pipeline.push({
        $match: {
          $or: [
            { 'karkunData.mehfilLocationId': { $in: locationIds } },
            { 'karkunData.cityLocationId': { $in: locationIds } },
          ],
        },
      });
    }

    if (dutyId || (dutyIds && dutyIds.length > 0)) {
      // A karkun is on a duty through team membership; a shift narrows it
      // to the teams assigned to that shift.
      const teamSelector: Record<string, unknown> = {
        dutyId: { $in: dutyId ? [dutyId] : dutyIds },
      };
      if (dutyShiftId) {
        const assignments = (await DutyTeamAssignments.find({
          shiftId: dutyShiftId,
        }).fetchAsync()) as Array<{ teamId: string }>;
        teamSelector._id = { $in: assignments.map(({ teamId }) => teamId) };
      }
      const teams = (await Teams.find(teamSelector).fetchAsync()) as Array<{
        members?: Array<{ karkunId: string }> | null;
      }>;
      const memberIds = teams.flatMap(team =>
        (team.members ?? []).map(({ karkunId }) => karkunId)
      );
      pipeline.push({
        $match: {
          _id: { $in: [...new Set(memberIds)] },
        },
      });
    }
  }

  // ************************************
  // Add criteria for employee data fields
  // ************************************
  if (jobId) {
    pipeline.push({
      $match: {
        'employeeData.jobId': { $eq: jobId },
      },
    });
  } else if (jobIds && jobIds.length > 0) {
    pipeline.push({
      $match: {
        'employeeData.jobId': { $in: jobIds },
      },
    });
  }

  // ********************************************
  // Add criteria for user account related fields
  // ********************************************
  if (userAccount) {
    const userAccountValue = userAccount === 'true';
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: 'personId',
        as: 'users',
      },
    });

    if (userAccountValue) {
      pipeline.push({
        $match: {
          'users.0': { $exists: true },
        },
      });
    } else {
      pipeline.push({
        $match: {
          'users.0': { $exists: false },
        },
      });
    }
  }

  // ************************************
  // Add filters against passed flags
  // Each flag is tri-state: true ORs the tag into the match, false
  // excludes it (AND NOT), and undefined/omitted ignores it entirely.
  // ************************************
  const orConditions: LooseRecord[] = [];
  const notConditions: LooseRecord[] = [];

  if (flags.includeKarkuns === true) {
    orConditions.push({ isKarkun: true });
  } else if (flags.includeKarkuns === false) {
    notConditions.push({ isKarkun: { $ne: true } });
  }
  if (flags.includeEmployees === true) {
    orConditions.push({ isEmployee: true });
  } else if (flags.includeEmployees === false) {
    notConditions.push({ isEmployee: { $ne: true } });
  }
  if (flags.includeVisitors === true) {
    orConditions.push({ isVisitor: true });
  } else if (flags.includeVisitors === false) {
    notConditions.push({ isVisitor: { $ne: true } });
  }

  let matchStage: LooseRecord | undefined;
  if (orConditions.length === 1) {
    matchStage = orConditions[0];
  } else if (orConditions.length > 1) {
    matchStage = { $or: orConditions };
  }

  if (notConditions.length > 0) {
    const notStage =
      notConditions.length === 1 ? notConditions[0] : { $and: notConditions };
    matchStage = matchStage ? { $and: [matchStage, notStage] } : notStage;
  }

  if (matchStage) {
    pipeline.push({ $match: matchStage });
  }

  return pipeline;
}

// Largest page a people search returns (the tables offer at most 100 rows a
// page), so a caller can't fetch a whole collection in one request.
export const MAX_PEOPLE_PAGE_SIZE = 100;

/**
 * flags contains the following
 * - includeKarkuns - defaults to false
 * - includeEmployees - defaults to false
 * - includeVisitors - defaults to false
 * - paginatedResults - defaults to true
 */
export async function searchPeople(
  params: LooseRecord = {},
  flags: SearchPeopleFlags = {}
) {
  const pipeline = await buildPeopleSearchPipeline(params, flags);
  const { pageIndex = '0', pageSize = '20' } = params;
  const paginatedResults = !isNil(flags.paginatedResults)
    ? flags.paginatedResults
    : true;

  if (paginatedResults) {
    const countingPipeline = pipeline.concat({
      $count: 'total',
    });

    const nPageIndex = Math.max(parseInt(pageIndex, 10) || 0, 0);
    const nPageSize = Math.min(
      Math.max(parseInt(pageSize, 10) || 20, 1),
      MAX_PEOPLE_PAGE_SIZE
    );
    const resultsPipeline = pipeline.concat([
      // _id breaks ties so pages don't overlap: skip/limit over a
      // non-unique sort key has no guaranteed order.
      { $sort: { 'sharedData.name': 1, _id: 1 } },
      { $skip: nPageIndex * nPageSize },
      { $limit: nPageSize },
    ]);

    const people = People.aggregate<PersonDocument>(resultsPipeline);
    const totalResults = People.aggregate<CountResult>(countingPipeline);

    return Promise.all([people, totalResults]).then(results => ({
      data: results[0],
      totalResults: get(results[1], ['0', 'total'], 0),
    }));
  }

  // Return the full results without pagination
  return People.aggregate(pipeline);
}
