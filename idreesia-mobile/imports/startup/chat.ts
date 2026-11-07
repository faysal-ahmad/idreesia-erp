import { Meteor } from 'meteor/meteor';

// The public chat page (imports/ui/chat) talks to Rocket.Chat's Livechat
// visitor API directly - those endpoints need no login, the visitor token is
// the credential. Signed-in features still go through the ERP backend.

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

export const chatUrl = trimTrailingSlash(
  Meteor.settings.public?.rocketChatUrl || ''
);
