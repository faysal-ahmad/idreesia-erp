import { PurchasingCounters } from 'meteor/idreesia-common/server/collections/purchasing';
import type { NumberedDocumentValue } from 'meteor/idreesia-common/constants/purchasing';

/**
 * The next document number for the type, e.g. `PO-2026-0007`. The sequence
 * restarts every year. Call it inside the transaction that inserts the
 * document, so a failed insert doesn't leave a gap.
 */
export async function nextDocumentNumber(
  type: NumberedDocumentValue,
  date: Date = new Date()
): Promise<string> {
  const year = date.getFullYear();
  const result = await PurchasingCounters.rawCollection().findOneAndUpdate(
    { type, year },
    { $inc: { seq: 1 }, $setOnInsert: { _id: `${type}-${year}` } },
    { upsert: true, returnDocument: 'after' }
  );
  // Driver v5 returns the document, v6 a { value } wrapper.
  const doc = (result as { value?: { seq: number } | null })?.value ?? result;
  const seq = (doc as { seq: number }).seq;
  return `${type}-${year}-${String(seq).padStart(4, '0')}`;
}
