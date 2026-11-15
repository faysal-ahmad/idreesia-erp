import gql from 'graphql-tag';

// Base root types. Every feature schema adds its fields with
// `extend type Query` / `extend type Mutation`, which fails unless the base
// type is declared somewhere - so it lives here rather than in whichever
// feature happens to be first.
export default gql`
type Query
type Mutation
`;
