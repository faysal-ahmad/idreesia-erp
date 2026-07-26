import gql from 'graphql-tag';

const PAGED_HR_KARKUNS = gql`
  query pagedHrKarkuns($filter: KarkunFilter) {
    pagedHrKarkuns(filter: $filter) {
      totalResults
      karkuns {
        _id
        name
        cnicNumber
        contactNumber1
        contactNumber1Subscribed
        contactNumber2
        contactNumber2Subscribed
        lastTarteebDate
        imageId
        job {
          _id
          name
        }
        duties {
          _id
          dutyId
          shiftId
          dutyName
          shiftName
          role
        }
      }
    }
  }
`;

export default PAGED_HR_KARKUNS;
