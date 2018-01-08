import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { merge } from 'react-komposer';
import { Button, Table } from 'antd';

import { composeWithTracker } from '/imports/ui/utils';
import { WithBreadcrumbs } from '/imports/ui/composers';
import { ItemTypes, ItemCategories, PhysicalStores } from '/imports/lib/collections/inventory';

class List extends Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    itemTypes: PropTypes.array,
    itemCategories: PropTypes.array,
    physicalStores: PropTypes.array
  };

  render() {
    return <h2>Stock Levels</h2>;
  }
}

export default WithBreadcrumbs(['Inventory', 'Stock Levels'])(List);
