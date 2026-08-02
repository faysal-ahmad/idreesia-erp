import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  KarkunDutiesByKarkunIdQuery,
  KarkunDutiesByKarkunIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const KARKUN_DUTIES_BY_KARKUN_ID: TypedDocumentNode<
  KarkunDutiesByKarkunIdQuery,
  KarkunDutiesByKarkunIdQueryVariables
> = gql`
  query karkunDutiesByKarkunId($karkunId: String!) {
    karkunDutiesByKarkunId(karkunId: $karkunId) {
      _id
      dutyId
      dutyName
      shiftId
      shiftName
      locationName
      role
      daysOfWeek
    }
  }
`;

export default KARKUN_DUTIES_BY_KARKUN_ID;
