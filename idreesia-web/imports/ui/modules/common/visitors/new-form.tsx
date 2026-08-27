import React from 'react';

import { ModuleNames } from 'meteor/idreesia-common/constants';
import PersonGeneralInfo, {
  type PersonGeneralInfoFormValues,
} from './general-info';

export type VisitorNewFormValues = PersonGeneralInfoFormValues;

interface Props {
  handleFinish(
    values: VisitorNewFormValues
  ): void | Promise<unknown>;
  handleCancel?(): void;
}

/**
 * New-visitor form — same sectioned layout as edit General Info,
 * without picture/audit (those belong on the edit page after create).
 */
const NewForm = ({ handleFinish, handleCancel }: Props) => (
  <PersonGeneralInfo
    person={{
      visitorData: {
        country: 'Pakistan',
        city: null,
        criminalRecord: null,
        otherNotes: null,
      },
    }}
    handleFinish={handleFinish}
    handleCancel={handleCancel}
    showAdditionalInfoSection
    showAuditInfo={false}
    tagsModuleFilter={ModuleNames.security}
  />
);

export default NewForm;
