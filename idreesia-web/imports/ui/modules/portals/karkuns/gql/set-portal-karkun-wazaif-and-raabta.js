import gql from 'graphql-tag';

const SET_PORTAL_KARKUN_WAZAIF_AND_RAABTA = gql`
  mutation setPortalKarkunWazaifAndRaabta(
    $portalId: String!
    $_id: String!
    $lastTarteebDate: String
    $mehfilRaabta: String
    $msRaabta: String
    $msLastVisitDate: String
  ) {
    setPortalKarkunWazaifAndRaabta(
      portalId: $portalId
      _id: $_id
      lastTarteebDate: $lastTarteebDate
      mehfilRaabta: $mehfilRaabta
      msRaabta: $msRaabta
      msLastVisitDate: $msLastVisitDate
    ) {
      _id
      lastTarteebDate
      mehfilRaabta
      msRaabta
      msLastVisitDate
    }
  }
`;
export default SET_PORTAL_KARKUN_WAZAIF_AND_RAABTA;
