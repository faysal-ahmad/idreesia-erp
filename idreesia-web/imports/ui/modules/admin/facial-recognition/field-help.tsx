import React from 'react';
import { Popover } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

interface Props {
  label: string;
  /** What the field does. */
  description: string;
  /** What raising and lowering it does. */
  effect: string;
  defaultValue: string;
  range: string;
  /** Extra explanation, e.g. a worked example. */
  note?: string;
}

// A field label with an information icon that opens the field's explanation in a popup.
const FieldHelp = ({ label, description, effect, defaultValue, range, note }: Props) => (
  <span>
    {label}{' '}
    <Popover
      trigger={['hover', 'click']}
      title={label}
      content={
        <div style={{ maxWidth: 360 }}>
          <p>{description}</p>
          <p>{effect}</p>
          {note ? <p>{note}</p> : null}
          <p style={{ marginBottom: 0 }}>
            <strong>Default:</strong> {defaultValue} · <strong>Allowed:</strong> {range}
          </p>
        </div>
      }
    >
      <InfoCircleOutlined style={{ color: '#667085', cursor: 'pointer' }} />
    </Popover>
  </span>
);

export default FieldHelp;
