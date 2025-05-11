import gql from 'graphql-tag';

export const CREATE_OUTSTATION_KARKUN_USER_ACCOUNT = gql`
  mutation createOutstationKarkunUserAccount($_id: String!, $email: String!) {
    createOutstationKarkunUserAccount(_id: $_id, email: $email) {
      _id
    }
  }
`;
