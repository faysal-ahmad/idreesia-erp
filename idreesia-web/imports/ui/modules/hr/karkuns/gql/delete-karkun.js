import gql from 'graphql-tag';

const DELETE_KARKUN = gql`
  mutation deleteKarkun($_id: String!) {
    deleteKarkun(_id: $_id)
  }
`;

export default DELETE_KARKUN;
