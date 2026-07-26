import { Mongo } from 'meteor/mongo';

type PipelineStage = Record<string, unknown>;

export default class AggregatableCollection<
  TDocument = Record<string, unknown>
> extends Mongo.Collection<TDocument> {
  aggregate<TResult = TDocument>(
    pipelines: PipelineStage[],
    options?: unknown
  ): Promise<TResult[]> {
    const rawCollection = this.rawCollection();
    return rawCollection.aggregate<TResult>(pipelines, options).toArray();
  }
}
