import gql from 'graphql-tag';

const APPROVE_ALL_SALARIES = gql`
  mutation approveAllSalaries($month: String!) {
    approveAllSalaries(month: $month)
  }
`;

export default APPROVE_ALL_SALARIES;
