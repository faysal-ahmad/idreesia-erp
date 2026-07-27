import React from 'react';
import PropTypes from 'prop-types';
import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';

const AntSortAscendingOutlined = SortAscendingOutlined as any;
const AntSortDescendingOutlined = SortDescendingOutlined as any;
type SortOrder = 'asc' | 'desc';
interface Props { headerKey: string; title?: React.ReactNode; sortBy?: string; sortOrder?: SortOrder; handleSortChange?(key: string, order: SortOrder): void; }

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

const Header = ({ headerKey, title, sortBy, sortOrder, handleSortChange }: Props) => {
  const sortAscendingStyle: Record<string, string> = {};
  if (headerKey === sortBy && sortOrder === 'asc') {
    sortAscendingStyle.color = '#1890FF';
  } else {
    sortAscendingStyle.cursor = 'pointer';
  }

  const sortDescendingStyle: Record<string, string> = {};
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
    <div style={HeaderStyle as any}>
      <span>{title}</span>
      <div style={IconsContainerStyle as any}>
        <AntSortAscendingOutlined
          style={sortAscendingStyle as any}
          onClick={handleSortAscendingClicked}
        />
        <AntSortDescendingOutlined
          style={sortDescendingStyle as any}
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
