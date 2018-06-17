import React from 'react';

import { WithBreadcrumbs } from '/imports/ui/composers';

const ViewForm = () => <div />;

export default WithBreadcrumbs(['Inventory', 'Stock Items', 'View'])(ViewForm);
