import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useQuery } from '@apollo/react-hooks';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { setBreadcrumbs } from 'meteor/idreesia-common/action-creators';
import { useQueryParams } from 'meteor/idreesia-common/hooks/common';
import { usePortal } from 'meteor/idreesia-common/hooks/portals';
import { toSafeInteger } from 'meteor/idreesia-common/utilities/lodash';
import {
  EntityTypes,
  OperationTypeDisplayNames,
} from 'meteor/idreesia-common/constants/audit';

import { AuditLogsList, AuditLogsListFilter } from '/imports/ui/modules/common';
import { PortalsSubModulePaths as paths } from '/imports/ui/modules/portals';

import { PAGED_PORTAL_AUDIT_LOGS } from '../gql';

const EntityTypeDisplayNames = {
  [EntityTypes.KARKUN]: 'Karkun',
  [EntityTypes.VISITOR]: 'Member',
};

const List = ({ history, location }) => {
  const dispatch = useDispatch();
  const { portalId } = useParams();
  const { portal } = usePortal();
  const { queryParams, setPageParams } = useQueryParams({
    history,
    location,
    paramNames: ['entityId', 'pageIndex', 'pageSize'],
  });

  const { data, refetch } = useQuery(PAGED_PORTAL_AUDIT_LOGS, {
    variables: { portalId, filter: queryParams },
  });

  useEffect(() => {
    if (portal) {
      dispatch(
        setBreadcrumbs(['Mehfil Portal', portal.name, 'Audit Logs', 'List'])
      );
    } else {
      dispatch(setBreadcrumbs(['Mehfil Portal', 'Audit Logs', 'List']));
    }
  }, [location, portal]);

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
    if (entityType === EntityTypes.KARKUN) {
      return (
        <Link to={paths.karkunsEditFormPath(portalId, _entityId)}>
          {`${EntityTypeDisplayNames[entityType]} [${OperationTypeDisplayNames[operationType]}]`}
        </Link>
      );
    } else if (entityType === EntityTypes.VISITOR) {
      return (
        <Link to={paths.membersEditFormPath(portalId, _entityId)}>
          {`${EntityTypeDisplayNames[entityType]} [${OperationTypeDisplayNames[operationType]}]`}
        </Link>
      );
    }

    return _entityId;
  };

  const pagedPortalAuditLogs = data
    ? data.pagedPortalAuditLogs
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
        pagedData={pagedPortalAuditLogs}
      />
    </>
  );
};

List.propTypes = {
  history: PropTypes.object,
  location: PropTypes.object,
};

export default List;
