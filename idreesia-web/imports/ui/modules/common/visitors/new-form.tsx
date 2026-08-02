import React from 'react';

import VisitorsGeneralInfo, {
  type VisitorGeneralInfoFormValues,
} from './general-info';

export type VisitorNewFormValues = VisitorGeneralInfoFormValues;

interface Props {
  handleFinish(
    values: VisitorNewFormValues
  ): void | Promise<unknown>;
  handleCancel?(): void;
}

/**
 * New-visitor form — same sectioned layout as edit General Info,
 * without notes/picture/audit (those belong on the edit page after create).
 */
const NewForm = ({ handleFinish, handleCancel }: Props) => (
  <VisitorsGeneralInfo
    visitor={{ country: 'Pakistan' }}
    handleFinish={handleFinish}
    handleCancel={handleCancel}
    showAuditInfo={false}
  />
);

export default NewForm;
