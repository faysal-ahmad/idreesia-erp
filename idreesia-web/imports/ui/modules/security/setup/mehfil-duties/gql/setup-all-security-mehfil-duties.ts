import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetupAllSecurityMehfilDutiesQuery,
  SetupAllSecurityMehfilDutiesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SETUP_ALL_SECURITY_MEHFIL_DUTIES: TypedDocumentNode<
  SetupAllSecurityMehfilDutiesQuery,
  SetupAllSecurityMehfilDutiesQueryVariables
> = gql`
  query setupAllSecurityMehfilDuties {
    allSecurityMehfilDuties {
      _id
      name
      urduName
      overallUsedCount
    }
  }
`;

export default SETUP_ALL_SECURITY_MEHFIL_DUTIES;
