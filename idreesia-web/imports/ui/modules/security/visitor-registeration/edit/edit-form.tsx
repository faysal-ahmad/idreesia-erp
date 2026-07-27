import React from 'react';
import PropTypes from 'prop-types';

import { get } from 'meteor/idreesia-common/utilities/lodash';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';
import { Tabs } from 'antd';
import GeneralInfo from './general-info';
import Picture from './picture';
import Notes from './notes';
import { VisitorStaysList } from '/imports/ui/modules/security/visitor-stays';

const AntTabs = Tabs as any;
const AntTabPane = (Tabs as any).TabPane;
const GeneralInfoComponent = GeneralInfo as any;
const PictureComponent = Picture as any;
const NotesComponent = Notes as any;
const VisitorStaysListComponent = VisitorStaysList as any;
interface EditFormProps { match?: { params?: { visitorId?: string } }; [key: string]: any; }

const EditForm = (props: EditFormProps) => {
  const visitorId = get(props, ['match', 'params', 'visitorId'], null);
  return (
    <AntTabs defaultActiveKey="1">
      <AntTabPane tab="General Info" key="1">
        <GeneralInfoComponent visitorId={visitorId} {...props} />
      </AntTabPane>
      <AntTabPane tab="Picture" key="2">
        <PictureComponent visitorId={visitorId} {...props} />
      </AntTabPane>
      <AntTabPane tab="Notes" key="3">
        <NotesComponent visitorId={visitorId} {...props} />
      </AntTabPane>
      <AntTabPane tab="Stay History" key="4">
        <VisitorStaysListComponent
          visitorId={visitorId}
          showNewButton
          showDutyColumn
          showActionsColumn
          {...props}
        />
      </AntTabPane>
    </AntTabs>
  );
};

EditForm.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object,
  location: PropTypes.object,
};

export default WithBreadcrumbs(['Security', 'Visitor Registration', 'Edit'])(
  EditForm as any
);
