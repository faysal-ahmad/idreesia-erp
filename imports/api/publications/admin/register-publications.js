import { default as profilesById } from './profiles/by-id';
import { default as profilesAll } from './profiles/all';
import { default as departmentsById } from './departments/by-id';
import { default as departmentsAll } from './departments/all';

Meteor.publish('admin/profiles#byId', profilesById);
Meteor.publish('admin/profiles#all', profilesAll);
Meteor.publish('admin/departments#byId', departmentsById);
Meteor.publish('admin/departments#all', departmentsAll);
