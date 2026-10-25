import React from 'react';
import { Button, Flex, Tag } from 'antd';

export interface FilterChip {
  key: string;
  label: string;
  value: string;
}

interface Props {
  chips: FilterChip[];
  onClear(key: string): void;
  onClearAll(): void;
}

const FilterChips = ({ chips, onClear, onClearAll }: Props) => {
  if (chips.length === 0) return null;

  return (
    <Flex
      wrap="wrap"
      gap={8}
      align="center"
      justify="flex-end"
      className="list-filter-chips"
    >
      {chips.map(chip => (
        <Tag
          key={chip.key}
          closable
          onClose={event => {
            event.preventDefault();
            onClear(chip.key);
          }}
        >
          <span>
            {chip.label}: {chip.value}
          </span>
        </Tag>
      ))}
      <Button type="link" size="small" onClick={onClearAll}>
        Clear all
      </Button>
    </Flex>
  );
};

export default FilterChips;
