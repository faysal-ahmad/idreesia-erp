import gql from 'graphql-tag';

const IMPORT_SECURITY_VISITORS_CSV_DATA = gql`
  mutation importSecurityVisitorsCsvData($csvData: String!) {
    importSecurityVisitorsCsvData(csvData: $csvData)
  }
`;

export default IMPORT_SECURITY_VISITORS_CSV_DATA;
