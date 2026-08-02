import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedAttendanceByHrPersonQuery,
  PagedAttendanceByHrPersonQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_ATTENDANCE_BY_KARKUN: TypedDocumentNode<
  PagedAttendanceByHrPersonQuery,
  PagedAttendanceByHrPersonQueryVariables
> = gql`
  query pagedAttendanceByHrPerson($queryString: String) {
    pagedAttendanceByKarkun(queryString: $queryString) {
      totalResults
      data {
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
