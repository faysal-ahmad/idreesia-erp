import { Migrations } from 'meteor/percolate:migrations';
import { People } from 'meteor/idreesia-common/server/collections/common';

Migrations.add({
  version: 39,
  up() {
    // Create the indexes
    const peopleCollection = People.rawCollection();
    peopleCollection.createIndex({ isEmployee: 1 }, { background: false });
    peopleCollection.createIndex({ isKarkun: 1 }, { background: false });
    peopleCollection.createIndex({ userId: 1 }, { background: false });
    peopleCollection.createIndex(
      { 'sharedData.name': 'text' },
      { background: false }
    );
    peopleCollection.createIndex(
      { 'sharedData.cnicNumber': 1 },
      { background: false }
    );
    peopleCollection.createIndex(
      { 'sharedData.contactNumber1': 1 },
      { background: false }
    );
    peopleCollection.createIndex(
      { 'sharedData.contactNumber2': 1 },
      { background: false }
    );
    peopleCollection.createIndex(
      { 'sharedData.ehadDate': 1 },
      { background: false }
    );
    peopleCollection.createIndex(
      { 'sharedData.bloodGroup': 1 },
      { background: false }
    );
    peopleCollection.createIndex(
      { 'visitorData.city': 1 },
      { background: false }
    );
    peopleCollection.createIndex(
      { 'visitorData.country': 1 },
      { background: false }
    );
    peopleCollection.createIndex(
      { 'karkunData.karkunId': 1 },
      { background: false }
    );
    peopleCollection.createIndex(
      { 'karkunData.ehadDate': 1 },
      { background: false }
    );
    peopleCollection.createIndex(
      { 'karkunData.lastTarteebDate': 1 },
      { background: false }
    );
    peopleCollection.createIndex(
      { 'employeeData.jobId': 1 },
      { background: false }
    );
    peopleCollection.createIndex(
      { 'employeeData.employmentStartDate': 1 },
      { background: false }
    );
    peopleCollection.createIndex(
      { 'employeeData.employmentEndDate': 1 },
      { background: false }
    );
  },
});
