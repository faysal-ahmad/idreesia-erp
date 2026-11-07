import React from 'react';
import type { IssuanceFormByIdQuery } from 'meteor/idreesia-common/types/client-operations';

import { AttachmentsList as AttachmentsListControl } from '/imports/ui/modules/helpers/controls';
import { AttachmentCategory } from 'meteor/idreesia-common/constants';

type IssuanceForm = NonNullable<IssuanceFormByIdQuery['issuanceFormById']>;

interface Props {
  issuanceFormById: IssuanceForm;
}

export const AttachmentsList = ({ issuanceFormById }: Props) => (
  <AttachmentsListControl
    category={AttachmentCategory.ISSUANCE_FORM}
    canEditAttachments={false}
    attachments={(issuanceFormById.attachments ?? undefined) as Parameters<typeof AttachmentsListControl>[0]['attachments']}
  />
);
