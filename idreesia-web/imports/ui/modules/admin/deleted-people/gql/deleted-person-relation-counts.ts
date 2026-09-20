import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeletedPersonRelationCountsQuery,
  DeletedPersonRelationCountsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETED_PERSON_RELATION_COUNTS: TypedDocumentNode<
  DeletedPersonRelationCountsQuery,
  DeletedPersonRelationCountsQueryVariables
> = gql`
  query deletedPersonRelationCounts($ids: [String!]!) {
    deletedPersonRelationCounts(ids: $ids) {
      personId
      total
      counts {
        name
        count
      }
    }
  }
`;

export default DELETED_PERSON_RELATION_COUNTS;
