import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityEventKarkunsByEventIdQuery,
  SecurityEventKarkunsByEventIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const SECURITY_EVENT_KARKUNS_BY_EVENT_ID: TypedDocumentNode<
  SecurityEventKarkunsByEventIdQuery,
  SecurityEventKarkunsByEventIdQueryVariables
> = gql`
  query securityEventKarkunsByEventId($eventId: String!, $dutyId: String) {
    securityEventKarkunsByEventId(eventId: $eventId, dutyId: $dutyId) {
      _id
      eventId
      karkunId
      dutyId
      dutyDetail
      dutyCardBarcodeId
      karkun {
        _id
        isKarkun
        sharedData {
          name
          imageUrl
          imageThumbnailUrl
          cnicNumber
          contactNumber1
          contactNumber2
        }
        visitorData {
          city
          country
        }
        karkunData {
          cityLocation {
            _id
            name
          }
        }
      }
    }
  }
`;
