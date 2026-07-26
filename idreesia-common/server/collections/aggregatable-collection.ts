// @ts-nocheck
import { Mongo } from 'meteor/mongo';

export default class AggregatableCollection extends Mongo.Collection {
  aggregate(pipelines, options) {
    const rawCollection = this.rawCollection();
    return rawCollection.aggregate(pipelines, options).toArray();
  }
}
