import React from 'react';
import dayjs from 'dayjs';
import {
  FileExcelOutlined,
  FileImageOutlined,
  FileOutlined,
  FilePdfOutlined,
  FilePptOutlined,
  FileTextOutlined,
  FileWordOutlined,
  FileZipOutlined,
  FolderFilled,
} from '@ant-design/icons';

import { Formats } from 'meteor/idreesia-common/constants';

import type { DocumentActivity } from './types';

export const formatSize = (size: number | null | undefined) => {
  if (size == null) return '';
  if (size < 1024) return `${size} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = size / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[unit]}`;
};

/** A millisecond timestamp (as a string) in the app's date-time format. */
export const formatDateTime = (value: string | null | undefined) =>
  value ? dayjs(Number(value)).format(Formats.DATE_TIME_FORMAT) : '';

const ICON_STYLE = { fontSize: 18 };

export const FolderIcon = () => (
  <FolderFilled style={{ ...ICON_STYLE, color: '#f0b429' }} />
);

/** An icon for the file's type. */
export const FileTypeIcon = ({ mimeType }: { mimeType: string | null }) => {
  const type = mimeType ?? '';
  const style = { ...ICON_STYLE, color: '#667085' };
  if (type === 'application/pdf') {
    return <FilePdfOutlined style={{ ...style, color: '#d92d20' }} />;
  }
  if (type.startsWith('image/')) return <FileImageOutlined style={style} />;
  if (type.includes('word') || type.includes('opendocument.text')) {
    return <FileWordOutlined style={{ ...style, color: '#1570ef' }} />;
  }
  if (type.includes('sheet') || type.includes('excel') || type === 'text/csv') {
    return <FileExcelOutlined style={{ ...style, color: '#079455' }} />;
  }
  if (type.includes('presentation') || type.includes('powerpoint')) {
    return <FilePptOutlined style={{ ...style, color: '#e04f16' }} />;
  }
  if (type.includes('zip') || type.includes('compressed')) {
    return <FileZipOutlined style={style} />;
  }
  if (type.startsWith('text/')) return <FileTextOutlined style={style} />;
  return <FileOutlined style={style} />;
};

const version = (details: Record<string, unknown>, key = 'versionNumber') =>
  details[key] != null ? `version ${details[key]}` : 'a version';

/** What an activity entry did, e.g. "uploaded version 3". */
export const describeActivity = ({ action, details }: DocumentActivity) => {
  switch (action) {
    case 'document-created':
      return 'added the document';
    case 'document-updated':
      return details.from && details.to
        ? `renamed it from "${details.from}" to "${details.to}"`
        : 'edited the details';
    case 'document-moved':
      return 'moved it';
    case 'document-copied':
      return 'made a copy';
    case 'document-trashed':
      return 'moved it to the trash';
    case 'document-restored':
      return 'restored it from the trash';
    case 'document-downloaded':
      return `downloaded ${version(details)}`;
    case 'document-checked-out':
      return 'checked it out';
    case 'document-checked-in':
      return 'checked it in';
    case 'document-force-unlocked':
      return 'removed the check-out lock';
    case 'version-added':
      return `uploaded ${version(details)}`;
    case 'version-restored':
      return `restored ${version(details, 'restoredFromVersionNumber')} as ${version(details)}`;
    case 'version-deleted':
      return `deleted ${version(details)}`;
    default:
      return action.replace(/-/g, ' ');
  }
};
