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
import type { PagedHrKarkunsAuditLogsQuery } from 'meteor/idreesia-common/types/client-operations';

import { AuditLogsList, AuditLogsListFilter } from '/imports/ui/modules/common';
import { HrKarkunsSubModulePaths as paths } from '/imports/ui/modules/hr-karkuns';

import { PAGED_HR_AUDIT_LOGS } from '../gql';

// Changes to karkun data, and to the shared data of people who are karkuns.
const EntityTypeDisplayNames: Record<string, string> = {
  [EntityType.KARKUN]: 'Karkun',
  [EntityType.PERSON]: 'Person',
};

type AuditLogRow = NonNullable<
  NonNullable<NonNullable<PagedHrKarkunsAuditLogsQuery['pagedHrKarkunsAuditLogs']>['data']>[number]
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
    dispatch(setBreadcrumbs(['HR - Karkuns', 'Audit Logs', 'List']));
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
    if (name && _entityId) {
      return (
        <Link to={paths.karkunsEditFormPath(_entityId)}>
          {`${name} [${OperationTypeDisplayName[operationType ?? ''] ?? ''}]`}
        </Link>
      );
    }

    return _entityId;
  };

  const pagedHrKarkunsAuditLogs = data?.pagedHrKarkunsAuditLogs ?? {
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
        data: (pagedHrKarkunsAuditLogs.data ?? []).filter(
          (row): row is AuditLogRow => row != null && row.entityId != null
        ),
        totalResults: pagedHrKarkunsAuditLogs.totalResults ?? 0,
      }}
    />
  );
};

export default List;
