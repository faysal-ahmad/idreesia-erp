import type { DocumentNode } from 'graphql';

declare global {
  type IdreesiaId = string;

  interface TimestampedDocument {
    _id?: IdreesiaId;
    createdAt?: Date;
    updatedAt?: Date;
  }

  interface IdreesiaGraphQLContext {
    userId?: IdreesiaId | null;
    user?: unknown;
    loaders?: Record<string, unknown>;
    [key: string]: unknown;
  }

  interface IdreesiaReduxState {
    breadcrumbs?: unknown;
    currentModule?: unknown;
    loggedInUserId?: IdreesiaId | null;
    [key: string]: unknown;
  }

  type IdreesiaResolver<TResult = unknown, TParent = unknown, TArgs = unknown> = (
    parent: TParent,
    args: TArgs,
    context: IdreesiaGraphQLContext
  ) => TResult | Promise<TResult>;

  type IdreesiaGraphQLOperation<TData = unknown, TVariables = Record<string, unknown>> = {
    document: DocumentNode;
    data?: TData;
    variables?: TVariables;
  };
}

export {};
