import type { Mongo } from 'meteor/mongo';

import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  IssuanceForms,
  PurchaseForms,
  StockItems,
} from 'meteor/idreesia-common/server/collections/inventory';
import { StorageFolders } from 'meteor/idreesia-common/server/file-storage';
import { get } from 'meteor/idreesia-common/utilities/lodash';

/**
 * A collection whose images are being moved from Attachments to object
 * storage by the "Move Images to Storage" and "Remove Migrated Images from
 * DB" jobs.
 */
export interface ImageMigrationSource {
  /** For log messages, e.g. "person". */
  label: string;
  collection: Mongo.Collection<any>;
  /** Object storage folder the images go into. */
  folder: string;
  /** Path to the object holding the image fields ('' for top level). */
  prefix: string;
  /** Whether the collection keeps a thumbnail next to the image. */
  hasThumbnail: boolean;
  /**
   * Fields derived from the image, cleared along with an image id that
   * points at a missing attachment.
   */
  derivedFields: string[];
}

export const IMAGE_MIGRATION_SOURCES: ImageMigrationSource[] = [
  {
    label: 'person',
    collection: People,
    folder: StorageFolders.PeopleImages,
    prefix: 'sharedData.',
    hasThumbnail: true,
    derivedFields: ['imageVectorData'],
  },
  {
    label: 'stock item',
    collection: StockItems,
    folder: StorageFolders.StockItemImages,
    prefix: '',
    hasThumbnail: false,
    derivedFields: [],
  },
];

/** Full field paths of a source's image fields. */
export const imageFields = ({ prefix }: ImageMigrationSource) => ({
  imageId: `${prefix}imageId`,
  imageThumbnailId: `${prefix}imageThumbnailId`,
  imageKey: `${prefix}imageKey`,
  imageThumbnailKey: `${prefix}imageThumbnailKey`,
});

export const readField = (doc: object, path: string): string | undefined =>
  (get(doc, path) as string | null | undefined) ?? undefined;

/**
 * A collection whose attachments (a list of Attachments ids) are being
 * moved to object storage by the same two jobs. Unlike images, the
 * Attachments docs stay - as name/type/fileKey records without the base64
 * content.
 */
export interface AttachmentMigrationSource {
  /** For log messages, e.g. "purchase form". */
  label: string;
  collection: Mongo.Collection<any>;
  /** Path of the attachment id array on the owning record. */
  field: string;
  /** Object storage folder the files go into. */
  folder: string;
}

export const ATTACHMENT_MIGRATION_SOURCES: AttachmentMigrationSource[] = [
  {
    label: 'purchase form',
    collection: PurchaseForms,
    field: 'attachmentIds',
    folder: StorageFolders.PurchaseFormAttachments,
  },
  {
    label: 'issuance form',
    collection: IssuanceForms,
    field: 'attachmentIds',
    folder: StorageFolders.IssuanceFormAttachments,
  },
  {
    label: 'profile',
    collection: People,
    field: 'karkunData.attachmentIds',
    folder: StorageFolders.ProfileAttachments,
  },
];
