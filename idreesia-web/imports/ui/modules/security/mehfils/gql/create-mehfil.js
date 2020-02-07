import gql from 'graphql-tag';

const CREATE_MEHFIL = gql`
  mutation createMehfil($name: String!, $mehfilDate: String!) {
    createMehfil(name: $name, mehfilDate: $mehfilDate) {
      _id
      name
      mehfilDate
    }
  }
`;

export default CREATE_MEHFIL;
