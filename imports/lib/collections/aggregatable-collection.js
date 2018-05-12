import { Mongo } from 'meteor/mongo';

export default class AggregatableCollection extends Mongo.Collection {
  constructor(name, options) {
    super(name, options);
  }

  wrapAsync = Meteor.wrapAsync ? Meteor.wrapAsync : Meteor._wrapAsync;

  aggregate(pipelines, options) {
    const rawCollection = this.rawCollection();
    return this.wrapAsync(rawCollection.aggregate.bind(rawCollection))(pipelines, options);
  }
}
