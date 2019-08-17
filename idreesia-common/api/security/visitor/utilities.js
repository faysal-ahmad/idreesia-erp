import { Visitors } from "meteor/idreesia-common/collections/security";

export function checkCnicNotInUse(cnicNumber, visitorId) {
  const visitor = Visitors.findOne({
    cnicNumber: { $eq: cnicNumber },
  });

  if (visitor && (!visitorId || visitor._id !== visitorId)) {
    throw new Error(`This CNIC number is already set for ${visitor.name}.`);
  }
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
