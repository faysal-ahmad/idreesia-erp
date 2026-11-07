import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import { putFile } from 'meteor/idreesia-common/server/file-storage';
import type { ProgressReporter } from 'meteor/idreesia-common/server/business-logic/jobs/report-progress';

import {
  ATTACHMENT_MIGRATION_SOURCES,
  IMAGE_MIGRATION_SOURCES,
  imageFields,
  readField,
  type AttachmentMigrationSource,
  type ImageMigrationSource,
} from './image-migration-sources';
import { getAttachmentFileKey } from './stored-attachments';
import { makeImageThumbnail, storeImage } from './stored-images';

type Outcome = 'moved' | 'cleared';

interface Task {
  /** e.g. "person abc123" - used in failure messages. */
  name: string;
  run(): Promise<Outcome>;
}

// ---------------------------------------------------------------------------
// Images: a single image (and optional thumbnail) per record
// ---------------------------------------------------------------------------

async function moveImage(
  source: ImageMigrationSource,
  doc: { _id: string }
): Promise<Outcome> {
  const fields = imageFields(source);
  const imageId = readField(doc, fields.imageId)!;
  const thumbnailId = source.hasThumbnail
    ? readField(doc, fields.imageThumbnailId)
    : undefined;

  const attachment = await Attachments.findOneAsync(imageId);
  if (!attachment) {
    // A dangling reference: the image is already gone, so there is nothing
    // to move. Clear it (and anything computed from it) so the record simply
    // has no image.
    if (thumbnailId) await Attachments.removeAsync(thumbnailId);
    await source.collection.updateAsync(doc._id, {
      $unset: Object.fromEntries(
        [
          fields.imageId,
          ...(source.hasThumbnail ? [fields.imageThumbnailId] : []),
          ...source.derivedFields.map(field => `${source.prefix}${field}`),
        ].map(field => [field, ''])
      ),
    });
    return 'cleared';
  }
  if (!attachment.mimeType?.startsWith('image/')) {
    throw new Error(
      `attachment '${imageId}' is not an image (${attachment.mimeType})`
    );
  }
  if (!attachment.data) {
    throw new Error(`attachment '${imageId}' has no content`);
  }

  // Copied as-is, not re-encoded, so existing face vectors stay valid.
  const image = Buffer.from(attachment.data, 'base64');
  let thumbnail: Buffer | null = null;
  if (source.hasThumbnail) {
    const thumbnailAttachment = thumbnailId
      ? await Attachments.findOneAsync(thumbnailId)
      : null;
    thumbnail = thumbnailAttachment?.data
      ? Buffer.from(thumbnailAttachment.data, 'base64')
      : await makeImageThumbnail(image).catch(() => null);
  }

  const { imageKey, imageThumbnailKey } = await storeImage(
    source.folder,
    doc._id,
    image,
    attachment.mimeType,
    thumbnail
  );
  await source.collection.updateAsync(doc._id, {
    $set: {
      [fields.imageKey]: imageKey,
      ...(imageThumbnailKey
        ? { [fields.imageThumbnailKey]: imageThumbnailKey }
        : {}),
    },
  });
  return 'moved';
}

async function getImageTasks(source: ImageMigrationSource): Promise<Task[]> {
  const fields = imageFields(source);
  const docs = (await source.collection
    .find(
      {
        [fields.imageId]: { $exists: true, $nin: [null, ''] },
        [fields.imageKey]: { $exists: false },
      },
      {
        fields: { [fields.imageId]: 1, [fields.imageThumbnailId]: 1 },
        transform: null,
      }
    )
    .fetchAsync()) as Array<{ _id: string }>;

  return docs.map(doc => ({
    name: `${source.label} ${doc._id}`,
    run: () => moveImage(source, doc),
  }));
}

// ---------------------------------------------------------------------------
// Attachments: a list of Attachments ids per record
// ---------------------------------------------------------------------------

async function moveAttachment(
  source: AttachmentMigrationSource,
  attachmentId: string
): Promise<Outcome> {
  const attachment = await Attachments.findOneAsync(attachmentId);
  if (!attachment?.data) {
    throw new Error(`attachment '${attachmentId}' has no content`);
  }

  const fileKey = getAttachmentFileKey(
    source.folder,
    attachmentId,
    attachment.name,
    attachment.mimeType
  );
  await putFile(
    fileKey,
    Buffer.from(attachment.data, 'base64'),
    attachment.mimeType
  );
  await Attachments.updateAsync(attachmentId, { $set: { fileKey } });
  return 'moved';
}

/** Removes an attachment id that points at a missing Attachments doc. */
async function clearDanglingAttachment(
  source: AttachmentMigrationSource,
  attachmentId: string
): Promise<Outcome> {
  // Raw collection: collection2 refuses an update whose selector isn't an _id.
  const raw = source.collection.rawCollection() as unknown as {
    updateMany(selector: object, modifier: object): Promise<unknown>;
  };
  await raw.updateMany(
    { [source.field]: attachmentId },
    { $pull: { [source.field]: attachmentId } }
  );
  return 'cleared';
}

async function getAttachmentTasks(
  source: AttachmentMigrationSource
): Promise<Task[]> {
  const referencedIds = (
    (await source.collection.rawCollection().distinct(source.field)) as unknown[]
  ).filter((id): id is string => typeof id === 'string' && id !== '');

  // Only ids and keys - the base64 content is read one attachment at a time.
  const existing = (await Attachments.find(
    { _id: { $in: referencedIds } },
    { fields: { _id: 1, fileKey: 1 } }
  ).fetchAsync()) as Array<{ _id: string; fileKey?: string }>;
  const existingIds = new Set(existing.map(({ _id }) => _id));

  const toMove = existing.filter(({ fileKey }) => !fileKey);
  const dangling = referencedIds.filter(id => !existingIds.has(id));

  return [
    ...toMove.map(({ _id }) => ({
      name: `${source.label} attachment ${_id}`,
      run: () => moveAttachment(source, _id),
    })),
    ...dangling.map(id => ({
      name: `${source.label} attachment ${id}`,
      run: () => clearDanglingAttachment(source, id),
    })),
  ];
}

// ---------------------------------------------------------------------------

/**
 * Copies files from Attachments into object storage:
 *  - images: people's profile photos (and thumbnails) and stock item images,
 *    recorded as image keys on the owning record;
 *  - attachments: purchase form, issuance form and karkun/employee
 *    attachments, recorded as a fileKey on the Attachments doc.
 *
 * Copy only: the base64 content stays in Mongo until
 * removeMigratedImagesFromDb runs. Re-running continues with whatever is not
 * yet copied. References to Attachments docs that no longer exist are
 * cleared.
 */
export async function moveImagesToStorage(
  reportProgress?: ProgressReporter
): Promise<number> {
  const tasks = (
    await Promise.all([
      ...IMAGE_MIGRATION_SOURCES.map(getImageTasks),
      ...ATTACHMENT_MIGRATION_SOURCES.map(getAttachmentTasks),
    ])
  ).flat();

  let moved = 0;
  let cleared = 0;
  const failures: string[] = [];

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    try {
      if ((await task.run()) === 'moved') moved++;
      else cleared++;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Moving ${task.name} failed:`, error);
      failures.push(task.name);
    }
    await reportProgress?.((i + 1) / tasks.length);
  }

  const summary = `Moved ${moved} files; cleared ${cleared} references to missing attachments`;
  if (failures.length > 0) {
    // Fails the run so it shows up in Job Logs; the moved files stay moved.
    throw new Error(
      `${summary}; ${failures.length} failed: ${failures.join(', ')}`
    );
  }
  // eslint-disable-next-line no-console
  console.log(`${summary}.`);
  return moved;
}
