import { Visitors } from 'meteor/idreesia-common/server/collections/security';

export function isCnicInUse(cnicNumber) {
  const visitor = Visitors.findOne({
    cnicNumber: { $eq: cnicNumber },
  });

  if (visitor) return true;
  return false;
}

export function checkCnicNotInUse(cnicNumber, visitorId) {
  const visitor = Visitors.findOne({
    cnicNumber: { $eq: cnicNumber },
  });

  if (visitor && (!visitorId || visitor._id !== visitorId)) {
    throw new Error(`This CNIC number is already set for ${visitor.name}.`);
  }
}

export function isContactNumberInUse(contactNumber) {
  const visitor = Visitors.findOne({
    $or: [
      { contactNumber1: { $eq: contactNumber } },
      { contactNumber2: { $eq: contactNumber } },
    ],
  });

  if (visitor) return true;
  return false;
}

export function checkContactNotInUse(contactNumber, visitorId) {
  const visitor = Visitors.findOne({
    $or: [
      { contactNumber1: { $eq: contactNumber } },
      { contactNumber2: { $eq: contactNumber } },
    ],
  });

  if (visitor && (!visitorId || visitor._id !== visitorId)) {
    throw new Error(`This contact number is already set for ${visitor.name}.`);
  }
}
