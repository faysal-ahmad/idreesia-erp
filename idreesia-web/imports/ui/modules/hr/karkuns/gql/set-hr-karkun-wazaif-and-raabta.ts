import gql from 'graphql-tag';

const SET_HR_KARKUN_WAZAIF_AND_RAABTA = gql`
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
