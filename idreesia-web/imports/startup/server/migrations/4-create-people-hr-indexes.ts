import { Migrations } from 'meteor/quave:migrations';

import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  Duties,
  DutyLocations,
  Salaries,
  Teams,
} from 'meteor/idreesia-common/server/collections/hr';
import { PEOPLE_IMAGE_VECTOR_SEARCH_INDEX } from 'meteor/idreesia-common/server/business-logic/common';
import { ensureDutiesAttendanceIndexes } from 'meteor/idreesia-common/server/business-logic/duties-attendance';
import { ensureDutyPlanIndexes } from 'meteor/idreesia-common/server/business-logic/hr/duty-planning';

async function createPeopleIndexes() {
  const people = People.rawCollection();
  await people.createIndex({ isEmployee: 1 }, { background: false });
  await people.createIndex({ isKarkun: 1 }, { background: false });
  await people.createIndex({ isVisitor: 1 }, { background: false });
  await people.createIndex({ userId: 1 }, { background: false });
  await people.createIndex({ 'sharedData.name': 'text' });
  for (const field of [
    'sharedData.cnicNumber',
    'sharedData.contactNumber1',
    'sharedData.contactNumber2',
    'sharedData.ehadDate',
    'sharedData.bloodGroup',
    'visitorData.city',
    'visitorData.country',
    'karkunData.karkunId',
    'karkunData.ehadDate',
    'karkunData.lastTarteebDate',
    'karkunData.cityLocationId',
    'karkunData.mehfilLocationId',
  ]) {
    await people.createIndex({ [field]: 1 }, { background: true });
  }
  for (const field of [
    'employeeData.jobId',
    'employeeData.employmentStartDate',
    'employeeData.employmentEndDate',
  ]) {
    await people.createIndex({ [field]: 1 }, { background: false });
  }
  await people.createIndex(
    {
      'sharedData.imageVectorData.status': 1,
      'sharedData.imageVectorData.computedAt': 1,
    },
    { background: true }
  );
}

// Backs the face-search lookup on the visitor registration page. This is an
// Atlas Search index (served by mongot), not an ordinary Mongo index.
async function createPeopleVectorSearchIndex() {
  const people = People.rawCollection();

  // createSearchIndex throws if the name already exists, and migrations get
  // re-run against environments that may already have it (a restored dump, a
  // rolled-back version counter).
  const existing = await people
    .aggregate<{ name: string }>([{ $listSearchIndexes: {} }])
    .toArray();
  if (existing.some(index => index.name === PEOPLE_IMAGE_VECTOR_SEARCH_INDEX)) {
    return;
  }

  await people.createSearchIndex({
    name: PEOPLE_IMAGE_VECTOR_SEARCH_INDEX,
    type: 'vectorSearch',
    definition: {
      fields: [
        {
          type: 'vector',
          path: 'sharedData.imageVectorData.vector',
          numDimensions: 128,
          similarity: 'cosine',
        },
      ],
    },
  });

  // The build is asynchronous - the index is not queryable the moment this
  // returns, and $vectorSearch yields nothing until it reaches READY. That
  // reads as "no matches" in the UI, so it is worth knowing from the logs that
  // it was only just requested.
  // eslint-disable-next-line no-console
  console.log(
    `Requested vector search index '${PEOPLE_IMAGE_VECTOR_SEARCH_INDEX}'; it builds in the background.`
  );
}

Migrations.add({
  version: 4,
  name: 'Create people and HR indexes',
  async up() {
    await createPeopleIndexes();
    await createPeopleVectorSearchIndex();

    const salaries = Salaries.rawCollection();
    await salaries.createIndex({ karkunId: 1 }, { background: false });
    await salaries.createIndex({ jobId: 1 }, { background: false });
    await salaries.createIndex({ month: 1 }, { background: false });

    await Teams.rawCollection().createIndex({ 'members.karkunId': 1 });
    await DutyLocations.rawCollection().createIndex(
      { dutyId: 1 },
      { background: false }
    );
    await Duties.rawCollection().createIndex({ committeeId: 1 });

    await ensureDutyPlanIndexes();
    await ensureDutiesAttendanceIndexes();
  },
});
