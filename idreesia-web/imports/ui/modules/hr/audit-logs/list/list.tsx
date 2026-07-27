import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/client/react';
import { Link } from 'react-router-dom';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import {
  EntityType,
  OperationTypeDisplayName,
} from 'meteor/idreesia-common/constants/audit';

import { AuditLogsList, AuditLogsListFilter } from '/imports/ui/modules/common';
import { HRSubModulePaths as paths } from '/imports/ui/modules/hr';

import { PAGED_HR_AUDIT_LOGS } from '../gql';

const EntityTypeDisplayNames = {
  [EntityType.KARKUN]: 'Karkun',
};

const RouterLink = Link as any;
const CommonAuditLogsList = AuditLogsList as any;
const CommonAuditLogsListFilter = AuditLogsListFilter as any;
interface HistoryLike { push(path: string): void; }
interface LocationLike { search: string; pathname: string; }
interface ListProps { history: HistoryLike; location: LocationLike; }
interface QueryParams { entityId?: string; pageIndex?: string | number; pageSize?: string | number; [key: string]: unknown; }
interface AuditLog { entityId: string; entityType: string; operationType: string; }
interface PagedAuditLogs { data: AuditLog[]; totalResults: number; }
interface QueryData { pagedHrAuditLogs?: PagedAuditLogs; }

const List = ({ history, location }: ListProps) => {
  const dispatch = useDispatch<any>();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['entityId', 'pageIndex', 'pageSize'],
  });

  const { data, refetch } = useQuery(PAGED_HR_AUDIT_LOGS as any, {
    variables: { filter: queryParams },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['HR', 'Audit Logs', 'List']));
  }, [location]);

  const { entityId, pageIndex, pageSize } = queryParams as QueryParams;

  const getTableHeader = () => (
    <div className="list-table-header">
      <div />
      <div className="list-table-header-section">
        <CommonAuditLogsListFilter
          entityId={entityId}
          setPageParams={setPageParams}
          refreshData={refetch}
        />
      </div>
    </div>
  );

  const getAuditLogEntityRenderer = (auditLog: AuditLog) => {
    const { entityId: _entityId, entityType, operationType } = auditLog;
    if (entityType === EntityType.KARKUN) {
      return (
        <RouterLink to={paths.karkunsEditFormPath(_entityId)}>
          {`${EntityTypeDisplayNames[entityType]} [${OperationTypeDisplayName[operationType]}]`}
        </RouterLink>
      );
    }

    return _entityId;
  };

  const pagedHrAuditLogs = data
    ? (data as QueryData).pagedHrAuditLogs
    : {
        data: [],
        totalResults: 0,
      };
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  return (
    <>
      <CommonAuditLogsList
        entityRenderer={getAuditLogEntityRenderer}
        listHeader={getTableHeader}
        setPageParams={setPageParams}
        pageIndex={numPageIndex}
        pageSize={numPageSize}
        pagedData={pagedHrAuditLogs}
      />
    </>
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
