import React from 'react';
import PropTypes from 'prop-types';
import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';

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
        <SortAscendingOutlined
          style={sortAscendingStyle}
          onClick={handleSortAscendingClicked}
        />
        <SortDescendingOutlined
          style={sortDescendingStyle}
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
