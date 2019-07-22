// import { Meteor } from "meteor/meteor";

export default function getDownloadUrl(attachmentId) {
  if (!attachmentId) return null;
  // return Meteor.absoluteUrl(`download-file?attachmentId=${attachmentId}`);
  return `${
    window.location.hostname
  }/download-file?attachmentId=${attachmentId}`;
}
