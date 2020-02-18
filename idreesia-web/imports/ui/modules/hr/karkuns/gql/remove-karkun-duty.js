import gql from 'graphql-tag';

const REMOVE_KARKUN_DUTY = gql`
  mutation removeKarkunDuty($_id: String!) {
    removeKarkunDuty(_id: $_id)
  }
`;

export default REMOVE_KARKUN_DUTY;
