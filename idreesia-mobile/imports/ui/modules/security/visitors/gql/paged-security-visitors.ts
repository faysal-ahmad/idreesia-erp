import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobilePagedSecurityVisitorsQuery,
  MobilePagedSecurityVisitorsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import { MOBILE_VISITOR_LIST_FIELDS } from './visitor-list-fields';

export const MOBILE_PAGED_SECURITY_VISITORS: TypedDocumentNode<
  MobilePagedSecurityVisitorsQuery,
  MobilePagedSecurityVisitorsQueryVariables
> = gql`
  query mobilePagedSecurityVisitors($filter: VisitorFilter) {
    pagedSecurityVisitors(filter: $filter) {
      totalResults
      data {
        ...MobileVisitorListFields
      }
    }
  }
  ${MOBILE_VISITOR_LIST_FIELDS}
`;
