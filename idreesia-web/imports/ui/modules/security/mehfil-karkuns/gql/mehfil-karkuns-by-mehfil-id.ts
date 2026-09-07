import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MehfilKarkunsByMehfilIdQuery,
  MehfilKarkunsByMehfilIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const MEHFIL_KARKUNS_BY_MEHFIL_ID: TypedDocumentNode<
  MehfilKarkunsByMehfilIdQuery,
  MehfilKarkunsByMehfilIdQueryVariables
> = gql`
  query mehfilKarkunsByMehfilId($mehfilId: String!, $dutyId: String) {
    mehfilKarkunsByMehfilId(mehfilId: $mehfilId, dutyId: $dutyId) {
      _id
      mehfilId
      karkunId
      dutyId
      dutyDetail
      dutyCardBarcodeId
      karkun {
        _id
        isKarkun
        sharedData {
          name
          imageId
          imageThumbnailId
          cnicNumber
          contactNumber1
          contactNumber2
        }
        visitorData {
          city
          country
        }
        karkunData {
          city {
            _id
            name
            country
          }
        }
      }
    }
  }
`;
