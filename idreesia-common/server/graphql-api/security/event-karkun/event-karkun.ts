import gql from 'graphql-tag';

export default gql`
type SecurityEventKarkunType {
  _id: String
  eventId: String
  karkunId: String
  dutyId: String
  dutyDetail: String
  dutyCardBarcodeId: String

  karkun: PersonType
  event: SecurityEventType
  duty: SecurityEventDutyType

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

extend type Query {
  securityEventKarkunsByEventId(eventId: String!, dutyId: String): [SecurityEventKarkunType]
  @checkPermissions(permissions: [SECURITY_VIEW_EVENTS, SECURITY_MANAGE_EVENTS])

  securityEventKarkunsByIds(ids: String!): [SecurityEventKarkunType]
  @checkPermissions(permissions: [SECURITY_VIEW_EVENTS, SECURITY_MANAGE_EVENTS])

  securityEventKarkunByBarcodeId(barcode: String!): SecurityEventKarkunType
  @checkPermissions(permissions: [SECURITY_VIEW_EVENTS, SECURITY_MANAGE_EVENTS])

  # People search behind the "Add Karkuns" picker on the event karkuns page.
  # Searches visitors, karkuns and employees.
  # Anyone who can be put on an event's duty.
  pagedSecurityEventPeople(
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedPickerPersonType
  @checkPermissions(permissions: [SECURITY_MANAGE_EVENTS])
}

extend type Mutation {
  addSecurityEventKarkun(eventId: String!, karkunId: String!, dutyId: String!): SecurityEventKarkunType
  @checkPermissions(permissions: [SECURITY_MANAGE_EVENTS])

  setDutyDetail(ids: [String]!, dutyDetail: String): [SecurityEventKarkunType]
  @checkPermissions(permissions: [SECURITY_MANAGE_EVENTS])

  removeSecurityEventKarkun(_id: String!): Int
  @checkPermissions(permissions: [SECURITY_MANAGE_EVENTS])
}
`;
