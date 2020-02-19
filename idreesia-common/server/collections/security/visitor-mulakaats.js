import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { VisitorMulakaat as VisitorMulakaatSchema } from 'meteor/idreesia-common/server/schemas/security';

class VisitorMulakaats extends AggregatableCollection {
  constructor(name = 'security-visitor-mulakaat', options = {}) {
    const visitorMulakaats = super(name, options);
    visitorMulakaats.attachSchema(VisitorMulakaatSchema);
    return visitorMulakaats;
  }
}

export default new VisitorMulakaats();
