import gql from 'graphql-tag';

const DELETE_HR_KARKUN = gql`
  mutation deleteHrKarkun($_id: String!) {
    deleteHrKarkun(_id: $_id)
  }
`;

export default DELETE_HR_KARKUN;
