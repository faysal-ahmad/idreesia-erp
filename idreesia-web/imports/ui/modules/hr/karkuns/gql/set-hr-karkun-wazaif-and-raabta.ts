import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SetHrKarkunWazaifAndRaabtaMutation,
  SetHrKarkunWazaifAndRaabtaMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SET_HR_KARKUN_WAZAIF_AND_RAABTA: TypedDocumentNode<
  SetHrKarkunWazaifAndRaabtaMutation,
  SetHrKarkunWazaifAndRaabtaMutationVariables
> = gql`
  mutation setHrKarkunWazaifAndRaabta(
    $_id: String!
    $lastTarteebDate: String
    $mehfilRaabta: String
    $msRaabta: String
  ) {
    setHrKarkunWazaifAndRaabta(
      _id: $_id
      lastTarteebDate: $lastTarteebDate
      mehfilRaabta: $mehfilRaabta
      msRaabta: $msRaabta
    ) {
      _id
      lastTarteebDate
      mehfilRaabta
      msRaabta
    }
  }
`;
export default SET_HR_KARKUN_WAZAIF_AND_RAABTA;
