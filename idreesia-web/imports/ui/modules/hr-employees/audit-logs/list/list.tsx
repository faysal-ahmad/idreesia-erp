import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/client/react';
import { Link } from 'react-router-dom';

import { type Location } from 'history';
import { type History } from 'history';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import {
  EntityType,
  OperationTypeDisplayName,
} from 'meteor/idreesia-common/constants/audit';
import type { PagedHrEmployeesAuditLogsQuery } from 'meteor/idreesia-common/types/client-operations';

import { AuditLogsList, AuditLogsListFilter } from '/imports/ui/modules/common';
import { HrEmployeesSubModulePaths as paths } from '/imports/ui/modules/hr-employees';

import { PAGED_HR_AUDIT_LOGS } from '../gql';

// The entries employee management shows (see pagedHrEmployeesAuditLogs).
const EntityTypeDisplayNames: Record<string, string> = {
  [EntityType.EMPLOYEE]: 'Employee',
  // Changes to the shared data of people who are employees.
  [EntityType.PERSON]: 'Person',
  [EntityType.HR_EMPLOYMENT_EVENT]: 'Employment Event',
  [EntityType.HR_JOB_SHIFT]: 'Job Shift',
  [EntityType.HR_LEAVE_TYPE]: 'Leave Type',
  [EntityType.HR_LEAVE_REQUEST]: 'Leave Request',
  [EntityType.HR_LEAVE_ADJUSTMENT]: 'Leave Adjustment',
};

// Where an entry's entity can be opened, when it has a page of its own.
const entityPath = (entityType: string, entityId: string) => {
  switch (entityType) {
    case EntityType.EMPLOYEE:
    case EntityType.PERSON:
      return paths.employeeEditFormPath(entityId);
    case EntityType.HR_LEAVE_REQUEST:
      return paths.leaveRequestPath(entityId);
    case EntityType.HR_LEAVE_TYPE:
      return paths.leaveTypesPath;
    case EntityType.HR_JOB_SHIFT:
      return paths.jobsPath;
    default:
      return null;
  }
};

type AuditLogRow = NonNullable<
  NonNullable<NonNullable<PagedHrEmployeesAuditLogsQuery['pagedHrEmployeesAuditLogs']>['data']>[number]
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

  const { data, refetch } = useQuery(PAGED_HR_AUDIT_LOGS, {
    variables: { filter: queryParams },
  });

  useEffect(() => {
    dispatch(setBreadcrumbs(['HR - Employees', 'Audit Logs', 'List']));
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
    const name = entityType ? EntityTypeDisplayNames[entityType] : undefined;
    if (!name || !_entityId) return _entityId;

    const label = `${name} [${OperationTypeDisplayName[operationType ?? ''] ?? ''}]`;
    const path = entityPath(entityType as string, _entityId);
    return path ? <Link to={path}>{label}</Link> : label;
  };

  const pagedHrEmployeesAuditLogs = data?.pagedHrEmployeesAuditLogs ?? {
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
        data: (pagedHrEmployeesAuditLogs.data ?? []).filter(
          (row): row is AuditLogRow => row != null && row.entityId != null
        ),
        totalResults: pagedHrEmployeesAuditLogs.totalResults ?? 0,
      }}
    />
  );
};

export default List;
