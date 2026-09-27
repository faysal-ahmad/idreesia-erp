import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DuplicatePersonRelationCountsQuery,
  DuplicatePersonRelationCountsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DUPLICATE_PERSON_RELATION_COUNTS: TypedDocumentNode<
  DuplicatePersonRelationCountsQuery,
  DuplicatePersonRelationCountsQueryVariables
> = gql`
  query duplicatePersonRelationCounts($ids: [String!]!) {
    duplicatePersonRelationCounts(ids: $ids) {
      personId
      total
      counts {
        name
        count
      }
    }
  }
`;

export default DUPLICATE_PERSON_RELATION_COUNTS;
