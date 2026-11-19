import { People } from 'meteor/idreesia-common/server/collections/common';

const findByCnic = (cnicNumber: string) =>
  People.findOneAsync({
    'sharedData.cnicNumber': { $eq: cnicNumber },
    deletedAt: { $exists: false },
  });

const findByContactNumber = (contactNumber: string) =>
  People.findOneAsync({
    $or: [
      { 'sharedData.contactNumber1': { $eq: contactNumber } },
      { 'sharedData.contactNumber2': { $eq: contactNumber } },
    ],
    deletedAt: { $exists: false },
  });

/** Whether a person that isn't deleted has this CNIC number. */
export async function isCnicInUse(cnicNumber: string): Promise<boolean> {
  return Boolean(await findByCnic(cnicNumber));
}

/** Whether a person that isn't deleted has this contact number. */
export async function isContactNumberInUse(
  contactNumber: string
): Promise<boolean> {
  return Boolean(await findByContactNumber(contactNumber));
}

/** Throws when another person (not `personId`) has this CNIC number. */
export async function assertCnicNotInUse(
  cnicNumber: string,
  personId?: string
): Promise<void> {
  const person = await findByCnic(cnicNumber);
  if (person && (!personId || person._id !== personId)) {
    throw new Error(
      `This CNIC number is already set for ${person.sharedData.name}.`
    );
  }
}

/** Throws when another person (not `personId`) has this contact number. */
export async function assertContactNotInUse(
  contactNumber: string,
  personId?: string
): Promise<void> {
  const person = await findByContactNumber(contactNumber);
  if (person && (!personId || person._id !== personId)) {
    throw new Error(
      `This contact number is already set for ${person.sharedData.name}.`
    );
  }
}
