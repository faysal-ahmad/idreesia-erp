import gql from 'graphql-tag';

const SET_OUTSTATION_KARKUN_WAZAIF_AND_RAABTA = gql`
  mutation setOutstationKarkunWazaifAndRaabta(
    $_id: String!
    $lastTarteebDate: String
    $mehfilRaabta: String
    $msRaabta: String
  ) {
    setOutstationKarkunWazaifAndRaabta(
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
export default SET_OUTSTATION_KARKUN_WAZAIF_AND_RAABTA;
