import { Mongo } from 'meteor/mongo';
import { describe, expect, it, vi } from 'vitest';

import { afterCommit, isInTransaction, onRollback, runInTransaction } from './transactions';

const Parents = new Mongo.Collection<any>('tx-parents');
const Children = new Mongo.Collection<any>('tx-children');

describe('runInTransaction', () => {
  it('commits every write', async () => {
    await runInTransaction(async () => {
      const parentId = await Parents.insertAsync({ name: 'p' });
      await Children.insertAsync({ parentId });
      await Parents.updateAsync(parentId, { $inc: { childCount: 1 } });
    });

    const parent = await Parents.findOneAsync({ name: 'p' });
    expect(parent?.childCount).toBe(1);
    expect(await Children.find({ parentId: parent._id }).countAsync()).toBe(1);
  });

  it('rolls back writes to every collection when it throws', async () => {
    await Parents.insertAsync({ _id: 'p1', childCount: 0 });

    await expect(
      runInTransaction(async () => {
        await Children.insertAsync({ parentId: 'p1' });
        await Parents.updateAsync('p1', { $inc: { childCount: 1 } });
        await Parents.rawCollection().updateMany({ _id: 'p1' }, { $set: { raw: true } });
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');

    expect(await Children.find({}).countAsync()).toBe(0);
    expect(await Parents.findOneAsync('p1')).toEqual({ _id: 'p1', childCount: 0 });
  });

  it('lets reads inside the transaction see its own writes, and hides them outside', async () => {
    let seenOutside: unknown = 'not read';
    let release: () => void = () => {};
    const gate = new Promise<void>(resolve => {
      release = resolve;
    });

    const tx = runInTransaction(async () => {
      await Parents.insertAsync({ _id: 'p2' });
      expect(await Parents.findOneAsync('p2')).toEqual({ _id: 'p2' });
      expect(await Parents.find({ _id: 'p2' }).fetchAsync()).toHaveLength(1);
      expect(
        await Parents.rawCollection().aggregate([{ $match: { _id: 'p2' } }]).toArray()
      ).toHaveLength(1);
      await gate;
    });

    // Let the transaction get to the gate, then read from outside it.
    await new Promise(resolve => {
      setTimeout(resolve, 200);
    });
    seenOutside = await Parents.findOneAsync('p2');
    release();
    await tx;

    expect(seenOutside).toBeUndefined();
    expect(await Parents.findOneAsync('p2')).toEqual({ _id: 'p2' });
  });

  it('joins an outer transaction, so an outer failure rolls back inner writes', async () => {
    await expect(
      runInTransaction(async () => {
        await runInTransaction(async () => {
          expect(isInTransaction()).toBe(true);
          await Parents.insertAsync({ _id: 'inner' });
        });
        throw new Error('outer failed');
      })
    ).rejects.toThrow('outer failed');

    expect(await Parents.findOneAsync('inner')).toBeUndefined();
  });

  it('runs concurrent operations inside one transaction', async () => {
    await Parents.insertAsync({ _id: 'c1', n: 0 });
    await runInTransaction(async () => {
      await Promise.all([
        Children.insertAsync({ parentId: 'c1', i: 1 }),
        Children.insertAsync({ parentId: 'c1', i: 2 }),
        Parents.updateAsync('c1', { $inc: { n: 2 } }),
        Parents.findOneAsync('c1'),
        Children.find({ parentId: 'c1' }).fetchAsync(),
      ]);
    });

    expect((await Parents.findOneAsync('c1'))?.n).toBe(2);
    expect(await Children.find({ parentId: 'c1' }).countAsync()).toBe(2);
  });

  it('runs afterCommit steps only after a commit', async () => {
    const committed = vi.fn();
    const rolledBack = vi.fn();

    await runInTransaction(async () => {
      await afterCommit(committed);
      expect(committed).not.toHaveBeenCalled();
      await Parents.insertAsync({ _id: 'a1' });
    });
    expect(committed).toHaveBeenCalledOnce();

    await expect(
      runInTransaction(async () => {
        await afterCommit(rolledBack);
        throw new Error('nope');
      })
    ).rejects.toThrow('nope');
    expect(rolledBack).not.toHaveBeenCalled();
  });

  it('runs afterCommit steps straight away outside a transaction', async () => {
    const step = vi.fn();
    await afterCommit(step);
    expect(step).toHaveBeenCalledOnce();
    expect(isInTransaction()).toBe(false);
  });

  it('does not fail the operation when an afterCommit step fails', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const value = await runInTransaction(async () => {
      await afterCommit(() => {
        throw new Error('notify failed');
      });
      return 42;
    });
    expect(value).toBe(42);
    expect(error).toHaveBeenCalled();
    error.mockRestore();
  });

  it('runs onRollback steps only when the transaction rolls back', async () => {
    const kept = vi.fn();
    const undone = vi.fn();

    await runInTransaction(async () => {
      await onRollback(kept);
    });
    expect(kept).not.toHaveBeenCalled();

    await expect(
      runInTransaction(async () => {
        await runInTransaction(async () => {
          await onRollback(undone);
        });
        throw new Error('later step failed');
      })
    ).rejects.toThrow('later step failed');
    expect(undone).toHaveBeenCalledOnce();
  });
});
