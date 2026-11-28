import { isEqual } from 'date-fns';
import type {
  PersonDocument,
  PersonInput,
} from 'meteor/idreesia-common/server/collections/common';
import { forOwn, isNil } from 'meteor/idreesia-common/utilities/lodash';

type LooseRecord = Record<string, any>;

const DATE_FIELDS = [
  'ehadDate',
  'birthDate',
  'lastTarteebDate',
  'employmentStartDate',
  'employmentEndDate',
  'probationEndDate',
  'confirmationDate',
];

// Arrays compared as sets: their order is not meaningful.
const UNORDERED_ARRAY_FIELDS = ['tagIds', 'workingDays'];

/**
 * Whether a person field's value has changed. Dates compare by time, and
 * `tagIds` and `workingDays` ignore order.
 */
export function isPersonValueChanged(
  key: string,
  newValue: unknown,
  existingValue: unknown
): boolean {
  if (isNil(existingValue) && isNil(newValue)) return false;

  if (DATE_FIELDS.includes(key)) {
    return !isEqual(
      new Date(existingValue as string | number | Date),
      new Date(newValue as string | number | Date)
    );
  }

  if (UNORDERED_ARRAY_FIELDS.includes(key)) {
    return (
      [...((existingValue as string[]) ?? [])].sort().join(',') !==
      [...((newValue as string[]) ?? [])].sort().join(',')
    );
  }

  return existingValue !== newValue;
}

const SUB_DOCUMENTS = [
  'sharedData',
  'karkunData',
  'visitorData',
  'employeeData',
] as const;

/**
 * The values in `newPerson` that differ from `existingPerson`, keyed by their
 * dotted Mongo path (e.g. `sharedData.name`), ready for a `$set`.
 */
export function getChangedPersonValues(
  newPerson: PersonInput,
  existingPerson: PersonDocument | null | undefined
): LooseRecord {
  const changedValues: LooseRecord = {};
  const topLevelProps = ['isVisitor', 'isKarkun', 'isEmployee', 'userId'];
  topLevelProps.forEach(prop => {
    const newValue = newPerson[prop];
    if (
      !isNil(newValue) &&
      isPersonValueChanged(prop, newValue, existingPerson?.[prop])
    ) {
      changedValues[prop] = newValue;
    }
  });

  SUB_DOCUMENTS.forEach(subDocument => {
    const newValues = newPerson[subDocument];
    if (!newValues) return;
    const existingValues = existingPerson?.[subDocument];
    forOwn(newValues, (newValue, key) => {
      if (isPersonValueChanged(key, newValue, existingValues?.[key])) {
        changedValues[`${subDocument}.${key}`] = newValue;
      }
    });
  });

  return changedValues;
}
