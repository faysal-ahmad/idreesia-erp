import { Migrations } from 'meteor/quave:migrations';

import { People } from 'meteor/idreesia-common/server/collections/common';
import { PEOPLE_IMAGE_VECTOR_SEARCH_INDEX } from 'meteor/idreesia-common/server/business-logic/common';

// Backs the face-search lookup on the visitor registration page. This is an Atlas Search index
// (served by mongot), not an ordinary Mongo index - migration 46's compound index on
// status + computedAt is unrelated and stays as it is.
Migrations.add({
  version: 48,
  async up() {
    const people = People.rawCollection();

    // createSearchIndex throws if the name already exists, and migrations get re-run against
    // environments that may already have it (a restored dump, a rolled-back version counter).
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

    // The build is asynchronous - the index is not queryable the moment this returns, and
    // $vectorSearch yields nothing until it reaches READY. That reads as "no matches" in the UI,
    // so it is worth knowing from the logs that it was only just requested.
    // eslint-disable-next-line no-console
    console.log(
      `Requested vector search index '${PEOPLE_IMAGE_VECTOR_SEARCH_INDEX}'; it builds in the background.`
    );
  },
});
