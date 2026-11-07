import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import { fileExists } from 'meteor/idreesia-common/server/file-storage';
import type { ProgressReporter } from 'meteor/idreesia-common/server/business-logic/jobs/report-progress';

import {
  ATTACHMENT_MIGRATION_SOURCES,
  IMAGE_MIGRATION_SOURCES,
  imageFields,
  readField,
  type ImageMigrationSource,
} from './image-migration-sources';

// DeleteMany batch size for orphaned attachments.
const ORPHAN_DELETE_BATCH_SIZE = 500;

interface Task {
  /** e.g. "person abc123" - used in skip messages. */
  name: string;
  /** Resolves false when the stored files are missing. */
  run(): Promise<boolean>;
}

// ---------------------------------------------------------------------------
// Images: drop the Attachments docs and the image ids
// ---------------------------------------------------------------------------

async function removeMigratedImage(
  source: ImageMigrationSource,
  doc: { _id: string }
): Promise<boolean> {
  const fields = imageFields(source);
  const keys = [
    readField(doc, fields.imageKey),
    source.hasThumbnail ? readField(doc, fields.imageThumbnailKey) : undefined,
  ].filter(Boolean) as string[];
  const exists = await Promise.all(keys.map(fileExists));

  if (!exists.every(Boolean)) {
    // Clearing the keys lets the copy job pick this record up again; its
    // Attachments copy is still in place.
    await source.collection.updateAsync(doc._id, {
      $unset: {
        [fields.imageKey]: '',
        ...(source.hasThumbnail ? { [fields.imageThumbnailKey]: '' } : {}),
      },
    });
    return false;
  }

  const attachmentIds = [
    readField(doc, fields.imageId),
    source.hasThumbnail ? readField(doc, fields.imageThumbnailId) : undefined,
  ].filter(Boolean) as string[];
  if (attachmentIds.length > 0) {
    await Attachments.removeAsync({ _id: { $in: attachmentIds } });
  }
  await source.collection.updateAsync(doc._id, {
    $unset: {
      [fields.imageId]: '',
      ...(source.hasThumbnail ? { [fields.imageThumbnailId]: '' } : {}),
    },
  });
  return true;
}

async function getImageTasks(source: ImageMigrationSource): Promise<Task[]> {
  const fields = imageFields(source);
  const docs = (await source.collection
    .find(
      {
        [fields.imageKey]: { $exists: true, $ne: null },
        $or: [
          { [fields.imageId]: { $exists: true } },
          ...(source.hasThumbnail
            ? [{ [fields.imageThumbnailId]: { $exists: true } }]
            : []),
        ],
      },
      {
        fields: {
          [fields.imageKey]: 1,
          [fields.imageThumbnailKey]: 1,
          [fields.imageId]: 1,
          [fields.imageThumbnailId]: 1,
        },
        transform: null,
      }
    )
    .fetchAsync()) as Array<{ _id: string }>;

  return docs.map(doc => ({
    name: `${source.label} ${doc._id}`,
    run: () => removeMigratedImage(source, doc),
  }));
}

// ---------------------------------------------------------------------------
// Attachments: keep the doc (name/type/fileKey), drop its base64 content
// ---------------------------------------------------------------------------

async function removeMigratedAttachmentData(attachment: {
  _id: string;
  fileKey: string;
}): Promise<boolean> {
  if (!(await fileExists(attachment.fileKey))) {
    // Clearing the key lets the copy job pick it up again; its base64
    // content is still in place.
    await Attachments.updateAsync(attachment._id, { $unset: { fileKey: '' } });
    return false;
  }
  await Attachments.updateAsync(attachment._id, { $unset: { data: '' } });
  return true;
}

async function getAttachmentTasks(): Promise<Task[]> {
  const attachments = (await Attachments.find(
    { fileKey: { $exists: true, $ne: null }, data: { $exists: true } },
    { fields: { _id: 1, fileKey: 1 } }
  ).fetchAsync()) as Array<{ _id: string; fileKey: string }>;

  return attachments.map(attachment => ({
    name: `attachment ${attachment._id}`,
    run: () => removeMigratedAttachmentData(attachment),
  }));
}

// ---------------------------------------------------------------------------
// Orphans: Attachments docs that still hold base64 content
// ---------------------------------------------------------------------------

const distinctIds = async (
  collection: { rawCollection(): unknown },
  field: string
): Promise<string[]> => {
  const raw = collection.rawCollection() as {
    distinct(field: string): Promise<unknown[]>;
  };
  return (await raw.distinct(field)).filter(
    (id): id is string => typeof id === 'string' && id !== ''
  );
};

/** Every Attachments id that a record still points at. */
async function getReferencedAttachmentIds(): Promise<Set<string>> {
  const lists = await Promise.all([
    ...IMAGE_MIGRATION_SOURCES.flatMap(source => {
      const fields = imageFields(source);
      return [
        distinctIds(source.collection, fields.imageId),
        ...(source.hasThumbnail
          ? [distinctIds(source.collection, fields.imageThumbnailId)]
          : []),
      ];
    }),
    ...ATTACHMENT_MIGRATION_SOURCES.map(source =>
      distinctIds(source.collection, source.field)
    ),
  ]);
  return new Set(lists.flat());
}

/**
 * Deletes the Attachments docs that still hold base64 content but that
 * nothing points at any more - uploads that were never saved to a record,
 * and images replaced back when the old one wasn't deleted. Docs that are
 * still referenced are kept (their content hasn't been moved yet) and
 * returned so the run can report them.
 */
async function removeOrphanedAttachments(): Promise<{
  removed: number;
  referenced: string[];
}> {
  const referencedIds = await getReferencedAttachmentIds();
  const withContent = (
    (await Attachments.find(
      { data: { $exists: true } },
      { fields: { _id: 1 } }
    ).fetchAsync()) as Array<{ _id: string }>
  ).map(({ _id }) => _id);

  const orphanIds = withContent.filter(id => !referencedIds.has(id));
  const referenced = withContent.filter(id => referencedIds.has(id));

  let removed = 0;
  for (let i = 0; i < orphanIds.length; i += ORPHAN_DELETE_BATCH_SIZE) {
    const batch = orphanIds.slice(i, i + ORPHAN_DELETE_BATCH_SIZE);
    // Deleted outright - the point is to get the content out of Mongo.
    removed += await Attachments.removeAsync({
      _id: { $in: batch },
      data: { $exists: true },
    });
  }
  return { removed, referenced };
}

// ---------------------------------------------------------------------------

/**
 * Removes from Mongo the content of files that have been copied to object
 * storage: the Attachments docs of migrated images (and the image ids
 * pointing at them), and the base64 content of migrated attachments (whose
 * docs stay, as name/type/fileKey records). Nothing is removed until its
 * files are confirmed to exist in object storage, so this never deletes the
 * only copy of a file.
 *
 * As the very last step, Attachments docs that still hold base64 content and
 * that no record points at (orphans) are deleted.
 */
export async function removeMigratedImagesFromDb(
  reportProgress?: ProgressReporter
): Promise<number> {
  const tasks = (
    await Promise.all([
      ...IMAGE_MIGRATION_SOURCES.map(getImageTasks),
      getAttachmentTasks(),
    ])
  ).flat();

  let removed = 0;
  const skipped: string[] = [];
  // The orphan sweep counts as one more step.
  const totalSteps = tasks.length + 1;

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    try {
      if (await task.run()) removed++;
      else skipped.push(task.name);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Cleaning up ${task.name} failed:`, error);
      skipped.push(task.name);
    }
    await reportProgress?.((i + 1) / totalSteps);
  }

  // Last: runs even when something above was skipped - anything still
  // referenced is kept regardless.
  const orphans = await removeOrphanedAttachments();
  await reportProgress?.(1);

  const summary = `Cleaned up ${removed} files; deleted ${orphans.removed} orphaned attachments`;
  const problems = [
    ...(skipped.length > 0
      ? [
          `skipped ${skipped.length} whose stored files are missing or unreadable: ${skipped.join(', ')}`,
        ]
      : []),
    ...(orphans.referenced.length > 0
      ? [
          `kept ${orphans.referenced.length} attachments that still hold content and are still referenced: ${orphans.referenced.join(', ')}`,
        ]
      : []),
  ];
  if (problems.length > 0) {
    // Fails the run so it shows up in Job Logs. Those keep their Mongo copy;
    // re-run the copy job, then this one.
    throw new Error(`${summary}; ${problems.join('; ')}`);
  }
  // eslint-disable-next-line no-console
  console.log(`${summary}.`);
  return removed;
}
