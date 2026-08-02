import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AllMehfilsQuery,
  AllMehfilsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ALL_MEHFILS: TypedDocumentNode<
  AllMehfilsQuery,
  AllMehfilsQueryVariables
> = gql`
  query allMehfils {
    allMehfils {
      _id
      name
      mehfilDate
      karkunCount
    }
  }
`;

export default ALL_MEHFILS;
