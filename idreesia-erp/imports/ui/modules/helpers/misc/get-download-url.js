import { Meteor } from "meteor/meteor";

export default function getDownloadUrl(attachmentId) {
  return Meteor.absoluteUrl(`download-file?attachmentId=${attachmentId}`);
}
