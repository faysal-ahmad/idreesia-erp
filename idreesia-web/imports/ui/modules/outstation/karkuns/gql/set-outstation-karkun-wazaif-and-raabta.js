import gql from 'graphql-tag';

export const SET_OUTSTATION_KARKUN_WAZAIF_AND_RAABTA = gql`
  mutation setOutstationKarkunWazaifAndRaabta(
    $_id: String!
    $lastTarteebDate: String
    $mehfilRaabta: String
    $msRaabta: String
    $msLastVisitDate: String
  ) {
    setOutstationKarkunWazaifAndRaabta(
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
