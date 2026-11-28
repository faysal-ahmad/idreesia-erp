import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetupAllSecurityEventDutiesQuery,
  SetupAllSecurityEventDutiesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SETUP_ALL_SECURITY_EVENT_DUTIES: TypedDocumentNode<
  SetupAllSecurityEventDutiesQuery,
  SetupAllSecurityEventDutiesQueryVariables
> = gql`
  query setupAllSecurityEventDuties {
    allSecurityEventDuties {
      _id
      name
      urduName
      overallUsedCount
    }
  }
`;

export default SETUP_ALL_SECURITY_EVENT_DUTIES;
