import { Meteor } from "meteor/meteor";

export default function getDownloadUrl(attachmentId) {
  return `${
    Meteor.settings.public.expressServerUrl
  }/download-file?attachmentId=${attachmentId}`;
}
