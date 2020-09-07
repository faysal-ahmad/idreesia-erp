import gql from 'graphql-tag';

const ALL_MEHFIL_DUTIES = gql`
  query allMehfilDuties {
    allMehfilDuties {
      _id
      name
      description
      usedCount
    }
  }
`;

export default ALL_MEHFIL_DUTIES;
