import gql from 'graphql-tag';

export default gql`
input KarkunFilter {
  name: String
  cnicNumber: String
  phoneNumber: String
  bloodGroup: String
  lastTarteeb: String
  attendance: String
  isKarkun: Boolean
  isEmployee: Boolean
  isVisitor: Boolean
  jobId: String
  dutyId: String
  userAccount: String
  ehadKarkun: String
  dutyShiftId: String
  cityId: String
  cityMehfilId: String
  region: String
  updatedBetween: String
  predefinedFilterName: String
  predefinedFilterStoreId: String
  pageIndex: String
  pageSize: String
}

type PagedKarkunType {
  totalResults: Int
  data: [PersonType]
}
`;
