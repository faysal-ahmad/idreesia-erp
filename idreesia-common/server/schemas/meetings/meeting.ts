import SimpleSchema from 'simpl-schema';

import {
  MeetingAttendanceStatus,
  MeetingParticipantRole,
  MeetingRsvpStatus,
  MeetingStatus,
} from 'meteor/idreesia-common/constants/meetings';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  workspaceId: {
    type: String,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
    optional: true,
  },
  location: {
    type: String,
    optional: true,
  },
  onlineUrl: {
    type: String,
    optional: true,
  },
  startsAt: {
    type: Date,
  },
  endsAt: {
    type: Date,
  },
  // IANA time zone the meeting is shown in. Times are stored in UTC.
  timeZone: {
    type: String,
  },
  status: {
    type: String,
    allowedValues: Object.values(MeetingStatus),
  },
  cancelledAt: {
    type: Date,
    optional: true,
  },
  cancelledBy: {
    type: String,
    optional: true,
  },
  cancellationReason: {
    type: String,
    optional: true,
  },
  completedAt: {
    type: Date,
    optional: true,
  },
  completedBy: {
    type: String,
    optional: true,
  },
  tags: {
    type: Array,
  },
  'tags.$': {
    type: String,
  },
  metadata: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  participants: {
    type: Array,
  },
  'participants.$': {
    type: Object,
  },
  // Opaque id chosen by the caller (e.g. a karkun id).
  'participants.$.participantId': {
    type: String,
  },
  'participants.$.role': {
    type: String,
    allowedValues: Object.values(MeetingParticipantRole),
  },
  'participants.$.rsvp': {
    type: Object,
  },
  'participants.$.rsvp.status': {
    type: String,
    allowedValues: Object.values(MeetingRsvpStatus),
  },
  'participants.$.rsvp.respondedAt': {
    type: Date,
    optional: true,
  },
  'participants.$.rsvp.comment': {
    type: String,
    optional: true,
  },
  'participants.$.attendance': {
    type: Object,
    optional: true,
  },
  'participants.$.attendance.status': {
    type: String,
    allowedValues: Object.values(MeetingAttendanceStatus),
  },
  'participants.$.attendance.note': {
    type: String,
    optional: true,
  },
  'participants.$.attendance.markedAt': {
    type: Date,
  },
  'participants.$.attendance.markedBy': {
    type: String,
  },
  // Array order is the agenda order.
  agenda: {
    type: Array,
  },
  'agenda.$': {
    type: Object,
  },
  'agenda.$._id': {
    type: String,
  },
  'agenda.$.title': {
    type: String,
  },
  'agenda.$.description': {
    type: String,
    optional: true,
  },
  'agenda.$.durationMinutes': {
    type: SimpleSchema.Integer,
    optional: true,
    min: 1,
  },
  'agenda.$.presenterId': {
    type: String,
    optional: true,
  },
  minutes: {
    type: Object,
    optional: true,
  },
  'minutes.text': {
    type: String,
  },
  'minutes.updatedAt': {
    type: Date,
  },
  'minutes.updatedBy': {
    type: String,
  },
  // Denormalised counts, for listings. No `min`: they change by $inc -1.
  attachmentCount: {
    type: SimpleSchema.Integer,
  },
  openActionItemCount: {
    type: SimpleSchema.Integer,
  },
  // Bumped on every change to the embedded participants/agenda, so
  // concurrent read-modify-write updates can't overwrite each other.
  revision: {
    type: SimpleSchema.Integer,
    min: 0,
  },
})
  .extend(identifiable)
  .extend(timestamps);
