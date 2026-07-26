import gql from 'graphql-tag';

const DELETE_ALL_SALARIES = gql`
  mutation deleteAllSalaries($month: String!) {
    deleteAllSalaries(month: $month)
  }
`;

export default DELETE_ALL_SALARIES;
