import fetchAuthorizedBlob from './fetch-authorized-blob';
import getDownloadUrl from './get-download-url';

// Long enough for the new tab to load the file before its URL is released.
const REVOKE_DELAY_MS = 60 * 1000;

/**
 * Opens an attachment (/download-file) in a new tab. The tab is opened before
 * the fetch, while the click still counts as a user action, so popup blockers
 * let it through.
 */
export default async function openAttachment(
  attachmentId: string
): Promise<void> {
  const url = getDownloadUrl(attachmentId);
  if (!url) return;

  const tab = window.open('', '_blank');
  try {
    const { blob } = await fetchAuthorizedBlob(url);
    const objectUrl = URL.createObjectURL(blob);
    if (tab) {
      tab.location.href = objectUrl;
    } else {
      window.open(objectUrl, '_blank');
    }
    setTimeout(() => URL.revokeObjectURL(objectUrl), REVOKE_DELAY_MS);
  } catch (error) {
    tab?.close();
    throw error;
  }
}
