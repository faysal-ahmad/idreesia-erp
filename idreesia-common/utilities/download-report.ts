import fetchAuthorizedBlob from './fetch-authorized-blob';

/**
 * Generates a report on the server (/generate-report) and saves it as a file.
 */
export default async function downloadReport(
  reportName: string,
  reportArgs: string
): Promise<void> {
  const url = `${window.location.origin}/generate-report?reportName=${encodeURIComponent(
    reportName
  )}&reportArgs=${encodeURIComponent(reportArgs)}`;
  const { blob, fileName } = await fetchAuthorizedBlob(url);

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName ?? `${reportName}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
