import gql from 'graphql-tag';

export default gql`
input KarkunFilter {
  name: String
  cnicNumber: String
  phoneNumber: String
  bloodGroup: String
  lastTarteeb: String
  attendance: String
  dutyId: String
  userAccount: String
  ehadKarkun: String
  dutyShiftId: String
  cityLocationId: String
  mehfilLocationId: String
  region: String
  updatedBetween: String
  pageIndex: String
  pageSize: String
}

type PagedKarkunType {
  totalResults: Int
  data: [PersonType]
}
`;
