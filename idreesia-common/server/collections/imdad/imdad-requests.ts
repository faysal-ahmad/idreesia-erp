import { isEqual, startOfDay, subDays } from 'date-fns';
import { Formats } from 'meteor/idreesia-common/constants';
import { get, forOwn, keys } from 'meteor/idreesia-common/utilities/lodash';
import { parseDate } from 'meteor/idreesia-common/utilities/date-fns';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { ImdadRequest as ImdadRequestSchema } from 'meteor/idreesia-common/server/schemas/imdad';
import { ImdadRequestStatus } from 'meteor/idreesia-common/constants/imdad';
import {
  DEFAULT_PAGE_INDEX,
  DEFAULT_PAGE_SIZE,
} from 'meteor/idreesia-common/constants/list-options';
import {
  // AuditLogs,
  Attachments,
} from 'meteor/idreesia-common/server/collections/common';

interface UserRef {
  _id: string;
}

interface ImdadRequestDocument {
  _id?: string;
  requestDate?: Date | string;
  visitorId?: string;
  imdadReasonId?: string;
  dataSource?: string;
  attachmentIds?: string[];
  [key: string]: any;
}

interface AttachmentValues {
  _id: string;
  attachmentId: string;
}

interface GetPagedDataParams {
  visitorId?: string;
  requestDate?: string;
  pageIndex?: string;
  pageSize?: string;
}

interface CountResult {
  total: number;
}

class ImdadRequests extends AggregatableCollection<ImdadRequestDocument> {
  constructor(name = 'imdad-imdad-requests', options = {}) {
    super(name, options);
    this.attachSchema(ImdadRequestSchema);
  }

  // **************************************************************
  // Create/Update Methods
  // **************************************************************
  async createImdadRequest(values: ImdadRequestDocument, user: UserRef) {
    const { requestDate, visitorId, imdadReasonId } = values;
    if (!values.dataSource) {
      throw new Error('Data Source is required to create an Imdad Request.');
    }

    if (!(await this.isImdadRequestAllowed(visitorId))) {
      throw new Error(
        'Visitor already has submitted an imdad request in the last 30 days.'
      );
    }

    const date = new Date();
    const valuesToInsert = Object.assign({}, values, {
      requestDate: startOfDay(new Date(requestDate ?? '')),
      imdadReasonId,
      status: ImdadRequestStatus.CREATED,
      createdAt: date,
      createdBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    });

    const imdadRequestId = await this.insertAsync(valuesToInsert);
    return this.findOneAsync(imdadRequestId);
  }

  async updateImdadRequest(values: ImdadRequestDocument, user: UserRef) {
    const { _id } = values;
    if (!_id) {
      throw new Error('Imdad Request id is required.');
    }
    const existingImdadRequest = await this.findOneAsync(_id);
    const changedValues = this.getChangedValues(values, existingImdadRequest);

    if (keys(changedValues).length === 0) {
      // Nothing actually changed
      return this.findOneAsync(_id);
    }

    const date = new Date();
    const valuesToUpdate = Object.assign({}, changedValues, {
      updatedAt: date,
      updatedBy: user._id,
    });

    await this.updateAsync(_id, { $set: valuesToUpdate });
    return this.findOneAsync(_id);
  }

  // Iterate through the incoming changed values and check which of the
  // values have actually changed.
  getChangedValues(
    newValues: ImdadRequestDocument,
    existingImdadRequest?: ImdadRequestDocument
  ) {
    const changedValues: Record<string, unknown> = {};
    forOwn(newValues, (newValue, key) => {
      if (this.isValueChanged(key, newValue, existingImdadRequest)) {
        changedValues[key] = newValue;
      }
    });

    return changedValues;
  }

  isValueChanged(
    key: string,
    newValue: unknown,
    existingImdadRequest: ImdadRequestDocument = {}
  ) {
    if (!existingImdadRequest[key] && !newValue) return false;
    let isChanged;

    switch (key) {
      case 'requestDate':
        isChanged = !isEqual(
          new Date(existingImdadRequest[key] as string | number | Date),
          new Date(newValue as string | number | Date)
        );
        break;

      case 'approvedImdad':
        break;

      default:
        isChanged = existingImdadRequest[key] !== newValue;
        break;
    }

    return isChanged;
  }

  async addAttachment({ _id, attachmentId }: AttachmentValues, user: UserRef) {
    const date = new Date();
    await this.updateAsync(
      { _id },
      {
        $addToSet: {
          attachmentIds: attachmentId,
        },
        $set: {
          updatedAt: date,
          updatedBy: user._id,
        },
      }
    );

    return this.findOneAsync(_id);
  }

  async removeAttachment(
    { _id, attachmentId }: AttachmentValues,
    user: UserRef
  ) {
    const date = new Date();
    await this.updateAsync(
      { _id },
      {
        $pull: {
          attachmentIds: attachmentId,
        },
        $set: {
          updatedAt: date,
          updatedBy: user._id,
        },
      }
    );

    await Attachments.removeAsync(attachmentId);
    return this.findOneAsync(_id);
  }
  // **************************************************************
  // Query Functions
  // **************************************************************
  getPagedData(params: GetPagedDataParams) {
    const pipeline: Record<string, unknown>[] = [];

    const {
      visitorId,
      requestDate,
      pageIndex = DEFAULT_PAGE_INDEX,
      pageSize = DEFAULT_PAGE_SIZE,
    } = params;

    if (visitorId) {
      pipeline.push({
        $match: {
          visitorId: { $eq: visitorId },
        },
      });
    }

    if (requestDate) {
      pipeline.push({
        $match: {
          requestDate: {
            $eq: startOfDay(parseDate(requestDate, Formats.DATE_FORMAT)),
          },
        },
      });
    }

    const countingPipeline = pipeline.concat({
      $count: 'total',
    });

    const nPageIndex = parseInt(pageIndex, 10);
    const nPageSize = parseInt(pageSize, 10);

    const resultsPipeline = pipeline.concat([
      { $sort: { requestDate: -1 } },
      { $skip: nPageIndex * nPageSize },
      { $limit: nPageSize },
    ]);

    const imdadRequests = this.aggregate<ImdadRequestDocument>(resultsPipeline);
    const totalResults = this.aggregate<CountResult>(countingPipeline);

    return Promise.all([imdadRequests, totalResults]).then(results => ({
      data: results[0],
      totalResults: get(results[1], ['0', 'total'], 0),
    }));
  }

  // **************************************************************
  // Utility Functions
  // **************************************************************
  async isImdadRequestAllowed(visitorId: string | undefined) {
    // Before creating, ensure that there isn't already another record created
    // for last 30 days for this visitor.
    const date = subDays(startOfDay(new Date()), 30);
    const previousRequest = await this.findOneAsync({
      visitorId,
      requestDate: { $gte: date },
    });

    if (previousRequest) return false;
    return true;
  }
}

export default new ImdadRequests();
