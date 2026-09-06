import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  HrKarkunByIdForKarkunsQuery,
  HrKarkunByIdForKarkunsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const HR_KARKUN_BY_ID: TypedDocumentNode<
  HrKarkunByIdForKarkunsQuery,
  HrKarkunByIdForKarkunsQueryVariables
> = gql`
  query hrKarkunByIdForKarkuns($_id: String!) {
    hrKarkunById(_id: $_id) {
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
        imageId
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
        cityId
        cityMehfilId
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
        duties {
          _id
          dutyName
          shiftName
          locationName
        }
      }
      employeeData {
        jobId
        employmentStartDate
        employmentEndDate
        bankAccountDetails
        job {
          _id
          name
        }
      }
    }
  }
`;

export default HR_KARKUN_BY_ID;
