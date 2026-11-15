import gql from 'graphql-tag';

export default gql`
directive @superAdminOnly on FIELD_DEFINITION`;
