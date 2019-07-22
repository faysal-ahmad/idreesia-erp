// import { Meteor } from "meteor/meteor";

export default function getUploadUrl() {
  // return Meteor.absoluteUrl("upload-base64-file");
  return `${window.location.hostname}/upload-base64-file`;
}
