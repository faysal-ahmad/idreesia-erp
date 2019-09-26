import React from 'react';
import PropTypes from 'prop-types';

import { Icon } from '/imports/ui/controls';

const HeaderStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  alignItems: 'center',
  width: '100%',
};

const IconsContainerStyle = {
  display: 'flex',
  flexFlow: 'row nowrap',
  paddingLeft: '10px',
  paddingRight: '10px',
  fontSize: 16,
};

const Header = ({ headerKey, title, sortBy, sortOrder, handleSortChange }) => {
  const sortAscendingStyle = {};
  if (headerKey === sortBy && sortOrder === 'asc') {
    sortAscendingStyle.color = '#1890FF';
  } else {
    sortAscendingStyle.cursor = 'pointer';
  }

  const sortDescendingStyle = {};
  if (headerKey === sortBy && sortOrder === 'desc') {
    sortDescendingStyle.color = '#1890FF';
  } else {
    sortDescendingStyle.cursor = 'pointer';
  }

  const handleSortAscendingClicked = () => {
    if (handleSortChange && (headerKey !== sortBy || sortOrder !== 'asc'))
      handleSortChange(headerKey, 'asc');
  };

  const handleSortDescendingClicked = () => {
    if (handleSortChange && (headerKey !== sortBy || sortOrder !== 'desc'))
      handleSortChange(headerKey, 'desc');
  };

  return (
    <div style={HeaderStyle}>
      <span>{title}</span>
      <div style={IconsContainerStyle}>
        <Icon
          style={sortAscendingStyle}
          type="sort-ascending"
          onClick={handleSortAscendingClicked}
        />
        <Icon
          style={sortDescendingStyle}
          type="sort-descending"
          onClick={handleSortDescendingClicked}
        />
      </div>
    </div>
  );
};

Header.propTypes = {
  headerKey: PropTypes.string,
  title: PropTypes.string,
  sortBy: PropTypes.string,
  sortOrder: PropTypes.string,
  handleSortChange: PropTypes.func,
};

export default Header;
