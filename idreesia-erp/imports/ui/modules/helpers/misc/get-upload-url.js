import { Meteor } from "meteor/meteor";

export default function getUploadUrl() {
  return Meteor.absoluteUrl("upload-base64-file");
}
