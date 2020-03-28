export default function getDownloadUrl(attachmentId) {
  if (!attachmentId) return null;
  if (Meteor.isCordova) {
    return `${Meteor.absoluteUrl()}/download-file?attachmentId=${attachmentId}`;
  }

  return `${window.location.origin}/download-file?attachmentId=${attachmentId}`;
}
