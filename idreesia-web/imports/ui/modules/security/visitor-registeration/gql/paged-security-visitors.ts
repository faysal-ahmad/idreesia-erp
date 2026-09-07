import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedSecurityVisitorsQuery,
  PagedSecurityVisitorsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_SECURITY_VISITORS: TypedDocumentNode<
  PagedSecurityVisitorsQuery,
  PagedSecurityVisitorsQueryVariables
> = gql`
  query pagedSecurityVisitors($filter: VisitorFilter) {
    pagedSecurityVisitors(filter: $filter) {
      totalResults
      data {
        _id
        isKarkun
        sharedData {
          name
          parentName
          referenceName
          cnicNumber
          contactNumber1
          contactNumber2
          imageId
          imageThumbnailId
          imageVectorData {
            status
          }
          tags {
            _id
            name
            color
            textColor
          }
        }
        visitorData {
          city
          country
          criminalRecord
          otherNotes
        }
      }
    }
  }
`;

export default PAGED_SECURITY_VISITORS;
