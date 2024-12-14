import { Migrations } from 'meteor/percolate:migrations';
// import { keyBy } from 'meteor/idreesia-common/utilities/lodash';
import { People } from 'meteor/idreesia-common/server/collections/common';
// import { Cities } from 'meteor/idreesia-common/server/collections/outstation';

Migrations.add({
  version: 38,
  up() {
    // Create the indexes
    const peopleCollection = People.rawCollection();
    peopleCollection.createIndex({ isEmployee: 1 }, { background: false });
    peopleCollection.createIndex({ isKarkun: 1 }, { background: false });
    peopleCollection.createIndex({ isVisitor: 1 }, { background: false });
    peopleCollection.createIndex({ userId: 1 }, { background: false });
    peopleCollection.createIndex({ 'sharedData.name': 'text' });
    peopleCollection.createIndex(
      { 'sharedData.cnicNumber': 1 },
      { background: true }
    );
    peopleCollection.createIndex(
      { 'sharedData.contactNumber1': 1 },
      { background: true }
    );
    peopleCollection.createIndex(
      { 'sharedData.contactNumber2': 1 },
      { background: true }
    );
    peopleCollection.createIndex(
      { 'sharedData.ehadDate': 1 },
      { background: true }
    );
    peopleCollection.createIndex(
      { 'sharedData.bloodGroup': 1 },
      { background: true }
    );
    peopleCollection.createIndex(
      { 'visitorData.city': 1 },
      { background: true }
    );
    peopleCollection.createIndex(
      { 'visitorData.country': 1 },
      { background: true }
    );
    peopleCollection.createIndex(
      { 'karkunData.karkunId': 1 },
      { background: true }
    );
    peopleCollection.createIndex(
      { 'karkunData.ehadDate': 1 },
      { background: true }
    );
    peopleCollection.createIndex(
      { 'karkunData.lastTarteebDate': 1 },
      { background: true }
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

    // Removed the collections code for Visitors and Karkuns
    // So commenting out this code that references those
    // Import the data
    /*
      const visitors = Visitors.find({}).fetch();
      const karkuns = Karkuns.find({}).fetch();
      const karkunsMap = keyBy(karkuns, '_id');
      const karkunsInsertedMap = {};

      const people = visitors.map(visitor => {
        const karkun = karkunsMap[visitor.karkunId];

        const person = {
          _id: visitor._id,
          isEmployee: karkun?.isEmployee || false,
          isKarkun: !!karkun,
          isVisitor: true,
          userId: karkun?.userId || null,
          createdAt: karkun?.createdAt || visitor.createdAt,
          createdBy: karkun?.createdBy || visitor.createdBy,
          updatedAt: karkun?.updatedAt || visitor.updatedAt,
          updatedBy: karkun?.updatedBy || visitor.updatedBy,
          sharedData: {
            name: karkun?.name || visitor.name,
            parentName: karkun?.parentName || visitor.parentName,
            cnicNumber: karkun?.cnicNumber || visitor.cnicNumber,
            birthDate: karkun?.birthDate || visitor.birthDate,
            currentAddress: karkun?.currentAddress || visitor.currentAddress,
            permanentAddress:
              karkun?.permanentAddress || visitor.permanentAddress,
            contactNumber1: karkun?.contactNumber1 || visitor.contactNumber1,
            contactNumber2: karkun?.contactNumber2 || visitor.contactNumber2,
            contactNumber1Subscribed:
              karkun?.contactNumber1Subscribed ||
              visitor.contactNumber1Subscribed ||
              false,
            contactNumber2Subscribed:
              karkun?.contactNumber2Subscribed ||
              visitor.contactNumber2Subscribed ||
              false,
            emailAddress: karkun?.emailAddress,
            bloodGroup: karkun?.bloodGroup,
            educationalQualification:
              karkun?.educationalQualification ||
              visitor.educationalQualification,
            meansOfEarning: karkun?.meansOfEarning || visitor.meansOfEarning,
            ehadDate: karkun?.ehadDate || visitor.ehadDate,
            referenceName: karkun?.referenceName || visitor.referenceName,
            deathDate: karkun?.deathDate,
            imageId: karkun?.imageId || visitor.imageId,
          },
          visitorData: {
            city: visitor.city,
            country: visitor.country,
            criminalRecord: visitor.criminalRecord,
            otherNotes: visitor.otherNotes,
          },
        };

        if (karkun) {
          karkunsInsertedMap[karkun._id] = true;

          person.karkunData = {
            karkunId: karkun._id,
            cityId: karkun.cityId,
            cityMehfilId: karkun.cityMehfilId,
            lastTarteebDate: karkun.lastTarteebDate,
            mehfilRaabta: karkun.mehfilRaabta,
            msRaabta: karkun.msRaabta,
            msLastVisitDate: karkun.msLastVisitDate,
            ehadKarkun: karkun.ehadKarkun,
            ehadPermissionDate: karkun.ehadPermissionDate,
            attachmentIds: karkun.attachmentIds,
          };

          if (karkun.isEmployee) {
            person.employeeData = {
              jobId: karkun.jobId,
              employmentStartDate: karkun.employmentStartDate,
              employmentEndDate: karkun.employmentEndDate,
            };
          }
        }

        return person;
      });

      // Now iterate through all karkuns and insert any that has not
      // already been inserted.
      karkuns.forEach(karkun => {
        if (karkunsInsertedMap[karkun._id] !== true) {
          const city = Cities.findOne(karkun.cityId);
          const person = {
            _id: karkun._id,
            isEmployee: karkun.isEmployee || false,
            isKarkun: true,
            isVisitor: false,
            userId: karkun?.userId || null,
            createdAt: karkun.createdAt,
            createdBy: karkun.createdBy,
            updatedAt: karkun.updatedAt,
            updatedBy: karkun.updatedBy,
            sharedData: {
              name: karkun.name,
              parentName: karkun.parentName,
              cnicNumber: karkun.cnicNumber,
              birthDate: karkun.birthDate,
              currentAddress: karkun.currentAddress,
              permanentAddress: karkun.permanentAddress,
              contactNumber1: karkun.contactNumber1,
              contactNumber2: karkun.contactNumber2,
              contactNumber1Subscribed: karkun.contactNumber1Subscribed || false,
              contactNumber2Subscribed: karkun.contactNumber2Subscribed || false,
              emailAddress: karkun.emailAddress,
              bloodGroup: karkun.bloodGroup,
              educationalQualification: karkun.educationalQualification,
              meansOfEarning: karkun.meansOfEarning,
              ehadDate: karkun.ehadDate,
              referenceName: karkun.referenceName,
              deathDate: karkun.deathDate,
              imageId: karkun.imageId,
            },
            karkunData: {
              karkunId: karkun._id,
              cityId: karkun.cityId,
              cityMehfilId: karkun.cityMehfilId,
              lastTarteebDate: karkun.lastTarteebDate,
              mehfilRaabta: karkun.mehfilRaabta,
              msRaabta: karkun.msRaabta,
              msLastVisitDate: karkun.msLastVisitDate,
              ehadKarkun: karkun.ehadKarkun,
              ehadPermissionDate: karkun.ehadPermissionDate,
              attachmentIds: karkun.attachmentIds,
            },
            visitorData: {
              city: city?.name,
              country: city?.country,
            },
          };

          if (karkun.isEmployee) {
            person.employeeData = {
              jobId: karkun.jobId,
              employmentStartDate: karkun.employmentStartDate,
              employmentEndDate: karkun.employmentEndDate,
            };
          }

          people.push(person);
        }
      });

      people.forEach(person => {
        People.insert(person);
      });
    */
  },
});
