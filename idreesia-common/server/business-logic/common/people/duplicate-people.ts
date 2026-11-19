import { People } from 'meteor/idreesia-common/server/collections/common';

/** CNIC numbers shared by more than one person that isn't deleted. */
export async function findDuplicateCnics() {
  return People.aggregate([
    {
      $match: {
        deletedAt: { $exists: false },
        'sharedData.cnicNumber': { $nin: [null, ''] },
      },
    },
    {
      $group: {
        _id: '$sharedData.cnicNumber',
        count: { $sum: 1 },
        people: {
          $push: {
            _id: '$_id',
            name: '$sharedData.name',
            cnicNumber: '$sharedData.cnicNumber',
            contactNumber1: '$sharedData.contactNumber1',
            contactNumber2: '$sharedData.contactNumber2',
            imageKey: '$sharedData.imageKey',
            imageThumbnailKey: '$sharedData.imageThumbnailKey',
            updatedAt: '$updatedAt',
          },
        },
      },
    },
    { $match: { count: { $gt: 1 } } },
    { $project: { _id: 0, value: '$_id', count: 1, people: 1 } },
    { $sort: { count: -1 } },
  ]);
}

/** Contact numbers shared by more than one person that isn't deleted. */
export async function findDuplicatePhoneNumbers() {
  return People.aggregate([
    { $match: { deletedAt: { $exists: false } } },
    {
      $project: {
        name: '$sharedData.name',
        cnicNumber: '$sharedData.cnicNumber',
        contactNumber1: '$sharedData.contactNumber1',
        contactNumber2: '$sharedData.contactNumber2',
        imageKey: '$sharedData.imageKey',
        imageThumbnailKey: '$sharedData.imageThumbnailKey',
        updatedAt: '$updatedAt',
        phones: {
          $setDifference: [
            ['$sharedData.contactNumber1', '$sharedData.contactNumber2'],
            [null, ''],
          ],
        },
      },
    },
    { $unwind: '$phones' },
    {
      $group: {
        _id: '$phones',
        count: { $sum: 1 },
        people: {
          $addToSet: {
            _id: '$_id',
            name: '$name',
            cnicNumber: '$cnicNumber',
            contactNumber1: '$contactNumber1',
            contactNumber2: '$contactNumber2',
            imageKey: '$imageKey',
            imageThumbnailKey: '$imageThumbnailKey',
            updatedAt: '$updatedAt',
          },
        },
      },
    },
    { $match: { count: { $gt: 1 } } },
    { $project: { _id: 0, value: '$_id', count: 1, people: 1 } },
    { $sort: { count: -1 } },
  ]);
}
