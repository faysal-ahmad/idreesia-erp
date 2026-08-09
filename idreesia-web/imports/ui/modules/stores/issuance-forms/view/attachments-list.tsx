import React from 'react';
import type { IssuanceFormByIdQuery } from 'meteor/idreesia-common/types/client-operations';

import { AttachmentsList as AttachmentsListControl } from '/imports/ui/modules/helpers/controls';

type IssuanceForm = NonNullable<IssuanceFormByIdQuery['issuanceFormById']>;

interface Props {
  issuanceFormById: IssuanceForm;
}

export const AttachmentsList = ({ issuanceFormById }: Props) => (
  <AttachmentsListControl
    canEditAttachments={false}
    attachments={(issuanceFormById.attachments ?? undefined) as Parameters<typeof AttachmentsListControl>[0]['attachments']}
  />
);
