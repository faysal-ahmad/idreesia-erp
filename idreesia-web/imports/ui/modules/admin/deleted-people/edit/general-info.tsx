import React from 'react';
import { type History } from 'history';

import { PersonGeneralInfo, PersonPicture } from '/imports/ui/modules/common';
import type { DeletedPersonByIdQuery } from 'meteor/idreesia-common/types/client-operations';
import { AdminSubModulePaths as paths } from '/imports/ui/modules/admin';

type DeletedPerson = NonNullable<DeletedPersonByIdQuery['deletedPersonById']>;

interface Props {
  history: History;
  person: DeletedPerson;
}

const GeneralInfo = ({ history, person }: Props) => (
  <PersonGeneralInfo
    person={person}
    hideSaveButton
    showAdditionalInfoSection
    handleCancel={() => history.push(paths.deletedPeoplePath)}
    sideContent={
      <PersonPicture
        imageId={person.sharedData?.imageId}
        personName={person.sharedData?.name ?? undefined}
      />
    }
  />
);

export default GeneralInfo;
