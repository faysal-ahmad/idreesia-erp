import gql from 'graphql-tag';

// Every operation names the mehfil it works on and declares the permission it
// needs with @checkMehfilKarkunsAccess. A super-admin holds every permission.
export default gql`
# A mehfil whose karkuns the caller can see, or one of its ancestors
# (hasWorkspace false), listed so the locations show in their hierarchy.
type MyMehfilKarkunsLocationType {
  locationId: String!
  name: String!
  type: String!
  parentId: String
  hasWorkspace: Boolean!
  permissions: [String!]!
}

type MehfilLocationKarkunType {
  _id: String!
  name: String
  parentName: String
  cnicNumber: String
  contactNumber1: String
  contactNumber2: String
  imageUrl: String
  imageThumbnailUrl: String
}

type PagedMehfilLocationKarkunType {
  data: [MehfilLocationKarkunType!]!
  totalResults: Int!
}

extend type Query {
  myMehfilKarkunsLocations: [MyMehfilKarkunsLocationType]!

  pagedMehfilKarkuns(
    locationId: String!
    name: String
    pageIndex: String
    pageSize: String
  ): PagedMehfilLocationKarkunType!
    @checkMehfilKarkunsAccess(permission: VIEW)
}
`;
