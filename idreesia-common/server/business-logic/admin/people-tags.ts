import {
  PeopleTags,
  type PeopleTagDocument,
} from 'meteor/idreesia-common/server/collections/admin';

interface UserRef {
  _id: string;
}

type PeopleTagValues = Pick<
  PeopleTagDocument,
  'name' | 'color' | 'textColor' | 'moduleNames'
>;

export async function createPeopleTag(
  { name, color, textColor, moduleNames }: PeopleTagValues,
  user: UserRef
) {
  const existingTag = await PeopleTags.findOneAsync({ name });
  if (existingTag) {
    throw new Error(`People Tag name '${name}' is already in use.`);
  }

  const date = new Date();
  const newTagId = await PeopleTags.insertAsync({
    name,
    color,
    textColor,
    moduleNames,
    createdAt: date,
    createdBy: user._id,
    updatedAt: date,
    updatedBy: user._id,
  });

  return PeopleTags.findOneAsync(newTagId);
}

export async function updatePeopleTag(
  { _id, name, color, textColor, moduleNames }: PeopleTagValues & { _id: string },
  user: UserRef
) {
  const date = new Date();
  await PeopleTags.updateAsync(_id, {
    $set: {
      name,
      color,
      textColor,
      moduleNames,
      updatedAt: date,
      updatedBy: user._id,
    },
  });

  return PeopleTags.findOneAsync(_id);
}

export async function removePeopleTag({ _id }: { _id: string }) {
  return PeopleTags.removeAsync(_id);
}
