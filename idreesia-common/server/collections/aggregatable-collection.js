import { Mongo } from 'meteor/mongo';

export default class AggregatableCollection extends Mongo.Collection {
  wrapAsync = Meteor.wrapAsync ? Meteor.wrapAsync : Meteor._wrapAsync;

  aggregate(pipelines, options) {
    const rawCollection = this.rawCollection();
    const cursor = rawCollection.aggregate(pipelines, options);
    return this.wrapAsync(cursor.toArray, cursor)();
  }
}
