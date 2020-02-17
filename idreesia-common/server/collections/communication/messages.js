import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Message as MessageSchema } from 'meteor/idreesia-common/server/schemas/communication';

class Messages extends AggregatableCollection {
  constructor(name = 'communication-messages', options = {}) {
    const messages = super(name, options);
    messages.attachSchema(MessageSchema);
    return messages;
  }
}

export default new Messages();
