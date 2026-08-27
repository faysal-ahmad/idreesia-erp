import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { PeopleTag as PeopleTagSchema } from 'meteor/idreesia-common/server/schemas/admin';

export interface PeopleTagDocument {
  _id?: string;
  name: string;
  color: string;
  textColor: string;
  moduleNames: string[];
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
}

interface UserRef {
  _id: string;
}

interface TagValues {
  _id: string;
  name: string;
  color: string;
  textColor: string;
  moduleNames: string[];
}

class PeopleTags extends AggregatableCollection<PeopleTagDocument> {
  constructor(name = 'people-tags', options = {}) {
    super(name, options);
    this.attachSchema(PeopleTagSchema);
  }

  async createTag(
    { name, color, textColor, moduleNames }: Omit<TagValues, '_id'>,
    user: UserRef
  ) {
    const existingTag = await this.findOneAsync({ name });
    if (existingTag) {
      throw new Error(`People Tag name '${name}' is already in use.`);
    }

    const date = new Date();
    const newTagId = await this.insertAsync({
      name,
      color,
      textColor,
      moduleNames,
      createdAt: date,
      createdBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    });

    return this.findOneAsync(newTagId);
  }

  async updateTag(
    { _id, name, color, textColor, moduleNames }: TagValues,
    user: UserRef
  ) {
    const date = new Date();
    await this.updateAsync(_id, {
      $set: {
        name,
        color,
        textColor,
        moduleNames,
        updatedAt: date,
        updatedBy: user._id,
      },
    });

    return this.findOneAsync(_id);
  }

  async removeTag({ _id }: { _id: string }) {
    return this.removeAsync(_id);
  }
}

export default new PeopleTags();
