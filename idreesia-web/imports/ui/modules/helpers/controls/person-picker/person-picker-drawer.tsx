import React, { type ReactNode } from 'react';
import { InfoCircleOutlined } from '@ant-design/icons';
import { Drawer, Tabs, Tooltip } from 'antd';

import PersonPickerList, { type PersonPickerRowOptions } from './person-picker-list';
import { usePersonSearch } from './use-person-search';
import type { PersonSearchSource, PickerPerson } from './types';

export interface PersonPickerTab {
  key: string;
  label: string;
  source: PersonSearchSource;
}

export interface PersonPickerDrawerProps extends PersonPickerRowOptions {
  open: boolean;
  title: ReactNode;
  /** Where the people come from; the query decides who may be listed. */
  source: PersonSearchSource;
  /** Extra tabs shown before the main list, each with its own source. */
  tabs?: PersonPickerTab[];
  /** The label of the main list's tab, when there are tabs. */
  sourceLabel?: string;
  /**
   * single: picking a person closes the drawer (filling a field).
   * multi: the drawer stays open so several people can be added in turn.
   */
  mode?: 'single' | 'multi';
  size?: number;
  onClose(): void;
}

/** The info tooltip: who each list shows. */
const PickerInfo = ({
  source,
  tabs,
  sourceLabel,
}: {
  source: PersonSearchSource;
  tabs?: PersonPickerTab[];
  sourceLabel: string;
}) => {
  const lists =
    tabs && tabs.length > 0
      ? [...tabs, { key: 'all', label: sourceLabel, source }]
      : [{ key: 'all', label: '', source }];
  const described = lists.filter(list => list.source.description);
  if (described.length === 0) return null;

  return (
    <Tooltip
      placement="bottomRight"
      title={
        <div>
          {described.map((list, index) => (
            <p
              key={list.key}
              style={{ margin: index < described.length - 1 ? '0 0 6px' : 0 }}
            >
              {list.label ? <strong>{list.label}: </strong> : null}
              {list.source.description}
            </p>
          ))}
        </div>
      }
    >
      <InfoCircleOutlined
        aria-label="Who is listed"
        style={{ fontSize: 18, cursor: 'help' }}
      />
    </Tooltip>
  );
};

const PickerBody = ({
  source,
  ...rowOptions
}: PersonPickerRowOptions & { source: PersonSearchSource }) => {
  const search = usePersonSearch(source);
  return <PersonPickerList search={search} {...rowOptions} />;
};

/**
 * The standard drawer for choosing a person. It starts a fresh search each
 * time it opens; the caller only says where the people come from (source)
 * and what happens when one is picked (onPick).
 */
const PersonPickerDrawer = ({
  open,
  title,
  source,
  tabs,
  sourceLabel = 'All',
  mode = 'multi',
  size = 900,
  onClose,
  onPick,
  ...rowOptions
}: PersonPickerDrawerProps) => {
  const handlePick = (person: PickerPerson) => {
    if (mode === 'single') onClose();
    onPick(person);
  };

  const body = (bodySource: PersonSearchSource) => (
    <PickerBody source={bodySource} onPick={handlePick} {...rowOptions} />
  );

  return (
    <Drawer
      title={title}
      size={size}
      open={open}
      onClose={onClose}
      destroyOnHidden
      extra={<PickerInfo source={source} tabs={tabs} sourceLabel={sourceLabel} />}
    >
      {tabs && tabs.length > 0 ? (
        <Tabs
          destroyOnHidden
          items={[
            ...tabs.map(tab => ({
              key: tab.key,
              label: tab.label,
              children: body(tab.source),
            })),
            { key: 'all', label: sourceLabel, children: body(source) },
          ]}
        />
      ) : (
        body(source)
      )}
    </Drawer>
  );
};

export default PersonPickerDrawer;
