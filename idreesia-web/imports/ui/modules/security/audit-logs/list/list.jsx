import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import { Link } from 'react-router-dom';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import {
  EntityTypes,
  OperationTypeDisplayNames,
} from 'meteor/idreesia-common/constants/audit';

import { AuditLogsList, AuditLogsListFilter } from '/imports/ui/modules/common';
import { SecuritySubModulePaths as paths } from '/imports/ui/modules/security';

import { PAGED_SECURITY_AUDIT_LOGS } from '../gql';

const EntityTypeDisplayNames = {
  [EntityTypes.VISITOR]: 'Visitor',
};

const List = ({ history, location }) => {
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
  }, [location]);

  const { entityId, pageIndex, pageSize } = queryParams;

  const getTableHeader = () => (
    <div className="list-table-header">
      <div />
      <div className="list-table-header-section">
        <AuditLogsListFilter
          entityId={entityId}
          setPageParams={setPageParams}
          refreshData={refetch}
        />
      </div>
    </div>
  );

  const getAuditLogEntityRenderer = auditLog => {
    const { entityId: _entityId, entityType, operationType } = auditLog;
    if (entityType === EntityTypes.VISITOR) {
      return (
        <Link to={paths.visitorRegistrationEditFormPath(_entityId)}>
          {`${EntityTypeDisplayNames[entityType]} [${OperationTypeDisplayNames[operationType]}]`}
        </Link>
      );
    }

    return _entityId;
  };

  const pagedSecurityAuditLogs = data
    ? data.pagedSecurityAuditLogs
    : {
        data: [],
        totalResults: 0,
      };
  const numPageIndex = pageIndex ? toSafeInteger(pageIndex) : 0;
  const numPageSize = pageSize ? toSafeInteger(pageSize) : 20;

  return (
    <>
      <AuditLogsList
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
