import React, { type CSSProperties } from 'react';
import { SortAscendingOutlined, SortDescendingOutlined } from '@ant-design/icons';

type SortOrder = 'asc' | 'desc';

interface Props {
  headerKey: string;
  title?: React.ReactNode;
  sortBy?: string;
  sortOrder?: SortOrder;
  handleSortChange?(key: string, order: SortOrder): void;
}

const HeaderStyle: CSSProperties = {
  display: 'flex',
  flexFlow: 'row nowrap',
  alignItems: 'center',
  width: '100%',
};

const IconsContainerStyle: CSSProperties = {
  display: 'flex',
  flexFlow: 'row nowrap',
  paddingLeft: '10px',
  paddingRight: '10px',
  fontSize: 16,
};

const Header = ({ headerKey, title, sortBy, sortOrder, handleSortChange }: Props) => {
  const sortAscendingStyle: CSSProperties = {};
  if (headerKey === sortBy && sortOrder === 'asc') {
    sortAscendingStyle.color = '#1890FF';
  } else {
    sortAscendingStyle.cursor = 'pointer';
  }

  const sortDescendingStyle: CSSProperties = {};
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

export default Header;
