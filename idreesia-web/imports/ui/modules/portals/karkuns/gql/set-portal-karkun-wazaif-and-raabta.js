import gql from 'graphql-tag';

const SET_PORTAL_KARKUN_WAZAIF_AND_RAABTA = gql`
  mutation setPortalKarkunWazaifAndRaabta(
    $portalId: String!
    $_id: String!
    $lastTarteebDate: String
    $mehfilRaabta: String
    $msRaabta: String
  ) {
    setPortalKarkunWazaifAndRaabta(
      portalId: $portalId
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
export default SET_PORTAL_KARKUN_WAZAIF_AND_RAABTA;
