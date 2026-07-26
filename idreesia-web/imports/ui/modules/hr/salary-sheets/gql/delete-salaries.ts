import gql from 'graphql-tag';

const DELETE_SALARIES = gql`
  mutation deleteSalaries($month: String!, $ids: [String]!) {
    deleteSalaries(month: $month, ids: $ids)
  }
`;

export default DELETE_SALARIES;
