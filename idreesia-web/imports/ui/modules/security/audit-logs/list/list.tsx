import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/client/react';
import { Link } from 'react-router-dom';

const RouterLink = Link as any;
import { type History, type Location } from 'history';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import {
  EntityType,
  OperationTypeDisplayName,
} from 'meteor/idreesia-common/constants/audit';
import type { PagedSecurityAuditLogsQuery } from 'meteor/idreesia-common/types/client-operations';

import { AuditLogsList, AuditLogsListFilter } from '/imports/ui/modules/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { PAGED_SECURITY_AUDIT_LOGS } from '../gql';

const EntityTypeDisplayNames = {
  [EntityType.VISITOR]: 'Visitor',
};

type AuditLogRow = NonNullable<
  NonNullable<NonNullable<PagedSecurityAuditLogsQuery['pagedSecurityAuditLogs']>['data']>[number]
>;

interface ListProps {
  history: History;
  location: Location;
}

const List = ({ history, location }: ListProps) => {
  const dispatch = useDispatch();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['entityId', 'pageIndex', 'pageSize'],
  });

  const { data, refetch } = useQuery(PAGED_SECURITY_AUDIT_LOGS, {
    variables: { filter: queryParams },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['Security', 'Audit Logs', 'List']));
  }, [dispatch, location]);

  const { entityId, pageIndex, pageSize } = queryParams;

  const handleFilterPageParams = (params: {
    pageIndex: number;
    entityId?: string | null;
    dataSource?: string | null;
  }) => {
    setPageParams({
      entityId: params.entityId ?? '',
      pageIndex: params.pageIndex,
    });
  };

  const handleTablePageParams = (params: { pageIndex: number; pageSize?: number }) => {
    setPageParams({
      pageIndex: params.pageIndex,
      pageSize: params.pageSize,
    });
  };

  const getTableHeader = () => (
    <div className="list-table-header">
      <div />
      <div className="list-table-header-section">
        <AuditLogsListFilter
          entityId={entityId as string | undefined}
          setPageParams={handleFilterPageParams}
          refreshData={refetch}
        />
      </div>
    </div>
  );

  const getAuditLogEntityRenderer = (auditLog: AuditLogRow) => {
    const { entityId: _entityId, entityType, operationType } = auditLog;
    if (entityType === EntityType.VISITOR && _entityId) {
      return (
        <RouterLink to={paths.visitorRegistrationEditFormPath(_entityId)}>
          {`${EntityTypeDisplayNames[entityType]} [${OperationTypeDisplayName[operationType ?? '']}]`}
        </RouterLink>
      );
    }

    return _entityId;
  };

  const pagedSecurityAuditLogs = data?.pagedSecurityAuditLogs ?? {
    data: [],
    totalResults: 0,
  };
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  return (
    <AuditLogsList
      entityRenderer={getAuditLogEntityRenderer}
      listHeader={getTableHeader}
      setPageParams={handleTablePageParams}
      pageIndex={numPageIndex}
      pageSize={numPageSize}
      pagedData={{
        data: (pagedSecurityAuditLogs.data ?? []).filter(
          (row): row is AuditLogRow => row != null && row.entityId != null
        ),
        totalResults: pagedSecurityAuditLogs.totalResults ?? 0,
      }}
    />
  );
};

export default List;
