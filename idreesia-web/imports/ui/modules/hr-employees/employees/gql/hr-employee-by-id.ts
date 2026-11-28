import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  HrEmployeeByIdQuery,
  HrEmployeeByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const HR_EMPLOYEE_BY_ID: TypedDocumentNode<
  HrEmployeeByIdQuery,
  HrEmployeeByIdQueryVariables
> = gql`
  query hrEmployeeById($_id: String!) {
    hrEmployeeById(_id: $_id) {
      _id
      isEmployee
      createdAt
      createdBy
      updatedAt
      updatedBy
      sharedData {
        name
        parentName
        cnicNumber
        imageUrl
        contactNumber1
        contactNumber2
        emailAddress
        currentAddress
        permanentAddress
        bloodGroup
        educationalQualification
        meansOfEarning
        ehadDate
        birthDate
        deathDate
        referenceName
      }
      karkunData {
        cityLocationId
        mehfilLocationId
        ehadKarkun
        ehadPermissionDate
        lastTarteebDate
        mehfilRaabta
        msRaabta
        attachments {
          _id
          name
          description
          mimeType
        }
      }
      employeeData {
        jobId
        jobShiftId
        workingDays
        reportsToPersonId
        employmentStatus
        employmentStartDate
        employmentEndDate
        probationEndDate
        confirmationDate
        bankAccountDetails
        job {
          _id
          name
        }
        jobShift {
          _id
          name
          startTime
          endTime
        }
        reportsTo {
          _id
          sharedData {
            name
            contactNumber1
            contactNumber2
          }
        }
      }
    }
  }
`;

export default HR_EMPLOYEE_BY_ID;
