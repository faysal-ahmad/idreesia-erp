import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@apollo/client/react';
import ReactToPrint from 'react-to-print';
import { Button, Divider } from 'antd';
import { PrinterOutlined } from '@ant-design/icons';

import { flowRight } from 'meteor/idreesia-common/utilities/lodash';
import {
  WithDynamicBreadcrumbs,
  WithQueryParams,
} from 'meteor/idreesia-common/composers/common';
import {
  WithMehfilId,
  WithMehfil,
} from '/imports/ui/modules/security/common/composers';

import { List } from './list';
import { MEHFIL_KARKUNS_BY_IDS } from '../../gql'

const PrintControl = ReactToPrint as any;
const AntButton = Button as any;
const AntDivider = Divider as any;
const AntPrinterOutlined = PrinterOutlined as any;
const PrintList = List as any;

const ControlsContainer = {
  display: 'flex',
  flexFlow: 'row wrap',
  justifyContent: 'space-between',
  width: '100%',
};

interface HistoryLike { goBack(): void; }
interface QueryParams { ids?: string; }
interface ListData { mehfilKarkunsByIds?: unknown[]; }
interface ListContainerProps { queryParams: QueryParams; history: HistoryLike; }

const ListContainer = ({ queryParams: { ids }, history }: ListContainerProps) => {
  const listRef = useRef<HTMLElement | null>(null);
  const { data, loading } = useQuery(MEHFIL_KARKUNS_BY_IDS as any, {
    variables: { ids },
  });

  if (loading) return null;

  return (
    <>
      <div style={ControlsContainer as any}>
        <div>
          <PrintControl
            content={() => listRef.current}
            trigger={() => (
              <AntButton size="large" type="primary" icon={<AntPrinterOutlined />}>
                Print List
              </AntButton>
            )}
          />
          &nbsp;&nbsp;
          <AntButton
            size="large"
            type="primary"
            onClick={() => {
              history.goBack();
            }}
          >
            Back
          </AntButton>
        </div>
      </div>
      <AntDivider />
      <PrintList
        ref={listRef}
        karkuns={(data as ListData | undefined)?.mehfilKarkunsByIds ?? []}
      />
    </>
  );
};

ListContainer.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
  queryParams: PropTypes.object,
};

export const MehfilKarkunsPrintList = flowRight(
  WithQueryParams(),
  WithMehfilId(),
  WithMehfil(),
  WithDynamicBreadcrumbs(({ mehfil }: { mehfil?: { name?: string } }) => {
    if (mehfil) {
      return `Security, Mehfils, ${mehfil.name}, Print Karkun List`;
    }
    return `Security, Mehfils, Print Karkun List`;
  })
)(ListContainer as any);
