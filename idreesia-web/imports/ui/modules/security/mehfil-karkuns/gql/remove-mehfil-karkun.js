import gql from 'graphql-tag';

const REMOVE_MEHFIL_KARKUN = gql`
  mutation removeMehfilKarkun($_id: String!) {
    removeMehfilKarkun(_id: $_id)
  }
`;

export default REMOVE_MEHFIL_KARKUN;
