export default function getDownloadUrl(attachmentId) {
  if (!attachmentId) return null;
  return `${window.location.origin}/download-file?attachmentId=${attachmentId}`;
}
