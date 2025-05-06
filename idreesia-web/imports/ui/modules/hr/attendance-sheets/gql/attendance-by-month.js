import gql from 'graphql-tag';

const ATTENDANCE_BY_MONTH = gql`
  query attendanceByMonth(
    $month: String!
    $categoryId: String
    $subCategoryId: String
  ) {
    attendanceByMonth(
      month: $month
      categoryId: $categoryId
      subCategoryId: $subCategoryId
    ) {
      _id
      karkunId
      month
      dutyId
      shiftId
      attendanceDetails
      presentCount
      absentCount
      percentage
      meetingCardBarcodeId
      karkun {
        _id
        name
        imageId
        cnicNumber
        contactNumber1
        contactNumber2
        image {
          _id
          data
        }
      }
      duty {
        _id
        name
      }
      shift {
        _id
        name
      }
      job {
        _id
        name
      }
    }
  }
`;

export default ATTENDANCE_BY_MONTH;
