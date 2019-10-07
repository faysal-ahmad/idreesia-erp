import React from 'react';
import { WithBreadcrumbs } from 'meteor/idreesia-common/composers/common';

const BlankPage = () => <div />;

export default WithBreadcrumbs(null)(BlankPage);
