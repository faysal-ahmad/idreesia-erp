import gql from 'graphql-tag';

const REMOVE_CITY_MEHFIL = gql`
  mutation removeCityMehfil($_id: String!) {
    removeCityMehfil(_id: $_id)
  }
`;

export default REMOVE_CITY_MEHFIL;
