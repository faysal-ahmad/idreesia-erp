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
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { PAGED_SECURITY_AUDIT_LOGS } from '../gql';

const EntityTypeDisplayNames = {
  [EntityType.VISITOR]: 'Visitor',
};

const AuditLogsListComponent = AuditLogsList as any;
const AuditLogsListFilterComponent = AuditLogsListFilter as any;
const RouterLink = Link as any;

interface HistoryLike {
  push(path: string): void;
}

interface LocationLike {
  pathname: string;
  search: string;
}

interface ListProps {
  history: HistoryLike;
  location: LocationLike;
}

interface QueryParams {
  entityId?: string;
  pageIndex?: string;
  pageSize?: string;
}

interface AuditLog {
  entityId: string;
  entityType: string;
  operationType: keyof typeof OperationTypeDisplayName;
}

interface PagedAuditLogs {
  data: AuditLog[];
  totalResults: number;
}

interface PagedAuditLogsData {
  pagedSecurityAuditLogs?: PagedAuditLogs;
}

const List = ({ history, location }: ListProps) => {
  const dispatch = useDispatch();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['entityId', 'pageIndex', 'pageSize'],
  });

  const { data, refetch } = useQuery(PAGED_SECURITY_AUDIT_LOGS as any, {
    variables: { filter: queryParams },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Security', 'Audit Logs', 'List']));
  }, [dispatch, location]);

  const { entityId, pageIndex, pageSize } = queryParams as QueryParams;

  const getTableHeader = () => (
    <div className="list-table-header">
      <div />
      <div className="list-table-header-section">
        <AuditLogsListFilterComponent
          entityId={entityId}
          setPageParams={setPageParams}
          refreshData={refetch}
        />
      </div>
    </div>
  );

  const getAuditLogEntityRenderer = (auditLog: AuditLog) => {
    const { entityId: _entityId, entityType, operationType } = auditLog;
    if (entityType === EntityType.VISITOR) {
      return (
        <RouterLink to={paths.visitorRegistrationEditFormPath(_entityId)}>
          {`${EntityTypeDisplayNames[entityType]} [${OperationTypeDisplayName[operationType]}]`}
        </RouterLink>
      );
    }

    return _entityId;
  };

  const pagedSecurityAuditLogs = data
    ? (data as PagedAuditLogsData).pagedSecurityAuditLogs
    : {
        data: [],
        totalResults: 0,
      };
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  return (
    <>
      <AuditLogsListComponent
        entityRenderer={getAuditLogEntityRenderer}
        listHeader={getTableHeader}
        setPageParams={setPageParams}
        pageIndex={numPageIndex}
        pageSize={numPageSize}
        pagedData={pagedSecurityAuditLogs}
      />
    </>
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
