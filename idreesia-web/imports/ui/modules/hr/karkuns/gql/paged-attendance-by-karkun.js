import gql from 'graphql-tag';

const PAGED_ATTENDANCE_BY_KARKUN = gql`
  query pagedAttendanceByKarkun($queryString: String) {
    pagedAttendanceByKarkun(queryString: $queryString) {
      totalResults
      attendance {
        _id
        dutyId
        shiftId
        jobId
        month
        absentCount
        presentCount
        percentage
        job {
          _id
          name
        }
        duty {
          _id
          name
        }
        shift {
          _id
          name
        }
      }
    }
  }
`;

export default PAGED_ATTENDANCE_BY_KARKUN;
