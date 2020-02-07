import gql from 'graphql-tag';

const UPDATE_MEHFIL = gql`
  mutation updateMehfil($_id: String!, $name: String!, $mehfilDate: String!) {
    updateMehfil(_id: $_id, name: $name, mehfilDate: $mehfilDate) {
      _id
      name
      mehfilDate
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default UPDATE_MEHFIL;
