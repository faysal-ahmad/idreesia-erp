import gql from 'graphql-tag';

// Duties and shifts owned by HR, read by the Security and Admin modules.
// HR itself uses allMSDuties / allDutyShifts. Keep these types free of
// committee, people and audit fields.
export default gql`
type ReferenceDutyType {
  _id: String
  name: String
}

type ReferenceDutyShiftType {
  _id: String
  dutyId: String
  name: String
}

extend type Query {
  # Consumers: Security visitor stays, Admin user karkun picker.
  referenceMsDuties: [ReferenceDutyType]
    @checkPermissions(
      permissions: [
        SECURITY_VIEW_VISITORS
        SECURITY_MANAGE_VISITORS
        ADMIN_VIEW_USERS_AND_GROUPS
        ADMIN_MANAGE_USERS_AND_GROUPS
      ]
    )
  # Consumers: Security visitor stays.
  referenceDutyShifts: [ReferenceDutyShiftType]
    @checkPermissions(
      permissions: [SECURITY_VIEW_VISITORS, SECURITY_MANAGE_VISITORS]
    )
}
`;
