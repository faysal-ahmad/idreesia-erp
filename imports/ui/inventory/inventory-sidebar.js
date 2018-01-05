import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const basePath = '/inventory';
const itemTypesPath = `${basePath}/item-types`;
const issuanceFormsPath = `${basePath}/issuance-forms`;
const receivalFormsPath = `${basePath}/receival-forms`;
const reportsPath = `${basePath}/reports`;

class InventorySidebar extends Component {
  static propTypes = {
    location: PropTypes.object
  };

  getClassNamesForPath(path) {
    const currentPath = this.props.location.pathname;
    if (currentPath.startsWith(path)) {
      return 'nav-link active';
    } else {
      return 'nav-link';
    }
  }

  render() {
    return (
      <React.Fragment>
        <li className="nav-item">
          <Link className={this.getClassNamesForPath(itemTypesPath)} to={itemTypesPath}>
            Item Types
          </Link>
        </li>
        <li className="nav-item">
          <Link className={this.getClassNamesForPath(issuanceFormsPath)} to={issuanceFormsPath}>
            Issuance Forms
          </Link>
        </li>
        <li className="nav-item">
          <Link className={this.getClassNamesForPath(receivalFormsPath)} to={receivalFormsPath}>
            Receival Forms
          </Link>
        </li>
        <li className="nav-item">
          <Link className={this.getClassNamesForPath(reportsPath)} to={reportsPath}>
            Reports
          </Link>
        </li>
      </React.Fragment>
    );
  }
}

export default InventorySidebar;
