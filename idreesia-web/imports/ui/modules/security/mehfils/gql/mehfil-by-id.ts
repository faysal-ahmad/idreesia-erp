import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MehfilByIdQuery,
  MehfilByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const MEHFIL_BY_ID: TypedDocumentNode<
  MehfilByIdQuery,
  MehfilByIdQueryVariables
> = gql`
  query mehfilById($_id: String!) {
    mehfilById(_id: $_id) {
      _id
      name
      mehfilDate
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default MEHFIL_BY_ID;
