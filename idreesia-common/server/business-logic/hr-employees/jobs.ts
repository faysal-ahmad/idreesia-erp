import { People } from 'meteor/idreesia-common/server/collections/common';
import { JobShifts, Jobs } from 'meteor/idreesia-common/server/collections/hr';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';

import { hrError } from '../hr-common/errors';

interface UserRef {
  _id: string;
}

interface JobValues {
  name: string;
  description?: string | null;
}

/** How many people (current or past employees) have this job. */
export async function countJobEmployees(jobId: string) {
  return People.find({ 'employeeData.jobId': jobId }).countAsync();
}

export async function createJob({ name, description }: JobValues, user: UserRef) {
  const date = new Date();
  const jobId = await Jobs.insertAsync({
    name,
    description,
    createdAt: date,
    createdBy: user._id,
    updatedAt: date,
    updatedBy: user._id,
  });
  return Jobs.findOneAsync(jobId);
}

export async function updateJob(
  id: string,
  { name, description }: JobValues,
  user: UserRef
) {
  await Jobs.updateAsync(id, {
    $set: { name, description, updatedAt: new Date(), updatedBy: user._id },
  });
  return Jobs.findOneAsync(id);
}

/** Removes a job and its shifts. Refused while anyone has the job. */
export async function removeJob(id: string) {
  return runInTransaction(async () => {
    if ((await countJobEmployees(id)) > 0) {
      throw hrError(
        'CONFLICT',
        'This job cannot be deleted as employees have it.'
      );
    }
    await JobShifts.removeAsync({ jobId: id });
    return Jobs.removeAsync(id);
  });
}
