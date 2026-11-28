import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityEventKarkunsByIdsQuery,
  SecurityEventKarkunsByIdsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const SECURITY_EVENT_KARKUNS_BY_IDS: TypedDocumentNode<
  SecurityEventKarkunsByIdsQuery,
  SecurityEventKarkunsByIdsQueryVariables
> = gql`
  query securityEventKarkunsByIds($ids: String!) {
    securityEventKarkunsByIds(ids: $ids) {
      _id
      eventId
      karkunId
      dutyId
      dutyDetail
      dutyCardBarcodeId
      duty {
        _id
        name
        urduName
      }
      karkun {
        _id
        isKarkun
        sharedData {
          name
          cnicNumber
          contactNumber1
          contactNumber2
          imageUrl
          imageThumbnailUrl
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
