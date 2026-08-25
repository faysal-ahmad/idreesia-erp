import gql from 'graphql-tag';

export default gql`
input KarkunFilter {
  name: String
  cnicNumber: String
  phoneNumber: String
  bloodGroup: String
  lastTarteeb: String
  attendance: String
  isEmployee: Boolean
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
  showVolunteers: String
  showEmployees: String
  pageIndex: String
  pageSize: String
}

type PagedKarkunType {
  totalResults: Int
  data: [PersonType]
}
`;
