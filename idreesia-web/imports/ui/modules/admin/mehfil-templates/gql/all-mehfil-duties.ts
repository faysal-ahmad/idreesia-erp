import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  AllMehfilDutiesQuery,
  AllMehfilDutiesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const ALL_MEHFIL_DUTIES: TypedDocumentNode<
  AllMehfilDutiesQuery,
  AllMehfilDutiesQueryVariables
> = gql`
  query allMehfilDuties {
    allMehfilDuties {
      _id
      name
      description
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default ALL_MEHFIL_DUTIES;
