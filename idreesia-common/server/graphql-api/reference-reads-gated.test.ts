import { describe, expect, it } from 'vitest';
import type { DocumentNode, FieldDefinitionNode } from 'graphql';

import DutyLocationSchema from './hr/duty-location/duty-location';
import JobSchema from './hr/job/job';
import KarkunSchema from './hr/karkun/karkun';
import EventDutySchema from './security/event-duty/event-duty';
import EventLangarDishSchema from './security/event-langar-dish/event-langar-dish';
import EventLangarLocationSchema from './security/event-langar-location/event-langar-location';
import VisitorStaySchema from './security/visitor-stay/visitor-stay';

// Reference and lookup reads that one module owns and only that module's
// screens call. Per docs/api-design-guidelines.md (Authorization → Reference
// data) the owner gates them with its own permissions, like allMSDuties. The
// permissions cover every screen that calls the query. Reads that other
// modules call get a reference* query instead; none of these are.
const HR_EMPLOYEES = [
  'HR_VIEW_EMPLOYEES',
  'HR_MANAGE_EMPLOYEES',
  'HR_MANAGE_EMPLOYEES_SETUP_DATA',
];
const HR_KARKUNS = [
  'HR_VIEW_KARKUNS',
  'HR_MANAGE_KARKUNS',
  'HR_MANAGE_KARKUNS_SETUP_DATA',
];
const EVENT_DUTIES = [
  'SECURITY_VIEW_EVENTS',
  'SECURITY_MANAGE_EVENTS',
  'SECURITY_MANAGE_SETUP_DATA',
];
const SETUP = ['SECURITY_MANAGE_SETUP_DATA'];
const VISITORS = ['SECURITY_VIEW_VISITORS', 'SECURITY_MANAGE_VISITORS'];

const expected: Array<[DocumentNode, string, string[]]> = [
  [JobSchema, 'allJobs', HR_EMPLOYEES],
  [JobSchema, 'jobById', HR_EMPLOYEES],
  [DutyLocationSchema, 'allDutyLocations', HR_KARKUNS],
  [KarkunSchema, 'hrCommitteeOptions', ['HR_MANAGE_KARKUNS_SETUP_DATA']],
  [EventDutySchema, 'allSecurityEventDuties', EVENT_DUTIES],
  [EventDutySchema, 'securityEventDutyById', EVENT_DUTIES],
  [EventLangarDishSchema, 'allSecurityEventLangarDishes', SETUP],
  [EventLangarDishSchema, 'securityEventLangarDishById', SETUP],
  [EventLangarLocationSchema, 'allSecurityEventLangarLocations', SETUP],
  [EventLangarLocationSchema, 'securityEventLangarLocationById', SETUP],
  [VisitorStaySchema, 'distinctStayAllowedBy', VISITORS],
];

const queryField = (doc: DocumentNode, name: string) => {
  const fields = doc.definitions.flatMap(definition =>
    (definition.kind === 'ObjectTypeDefinition' ||
      definition.kind === 'ObjectTypeExtension') &&
    definition.name.value === 'Query'
      ? [...(definition.fields ?? [])]
      : []
  );
  return fields.find(field => field.name.value === name);
};

const permissionsOf = (field: FieldDefinitionNode) => {
  const directive = field.directives?.find(
    ({ name }) => name.value === 'checkPermissions'
  );
  const list = directive?.arguments?.find(
    ({ name }) => name.value === 'permissions'
  )?.value;
  if (!list || list.kind !== 'ListValue') return undefined;
  return list.values.map(value => ('value' in value ? String(value.value) : ''));
};

describe('reference reads are gated by their owner', () => {
  it.each(expected)('%#: %s', (doc, name, permissions) => {
    const field = queryField(doc, name);
    expect(field, `${name} is defined`).toBeDefined();
    expect(permissionsOf(field!)?.sort()).toEqual([...permissions].sort());
  });
});
