import React from 'react';
import { Col, Row, Spin } from 'antd';
import { ExclamationCircleTwoTone } from '@ant-design/icons';

import VisitorCard, { type CardPerson } from './visitor-card';

const NoRecordFoundColor = 'orange';

interface Props {
  people: CardPerson[];
  loading?: boolean;
  // Wording differs by search - a CNIC that matched nothing is a different message from a photo
  // that matched nobody - so the containers supply it.
  emptyMessage: string;
}

// Shared by both searches on this page: the CNIC lookup renders zero or one card here, face
// search renders up to five already ordered best-first.
const ResultGrid = ({ people, loading = false, emptyMessage }: Props) => {
  if (loading) return <Spin size="large" />;

  if (people.length === 0) {
    return (
      <Row justify="start" align="middle" gutter={16}>
        <Col>
          <ExclamationCircleTwoTone
            className="visitor-result-empty-icon"
            twoToneColor={NoRecordFoundColor}
          />
        </Col>
        <Col>
          <div className="visitor-result-empty-text">{emptyMessage}</div>
        </Col>
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]}>
      {people.map(person => (
        <Col key={person._id} xs={24} sm={12} md={8} lg={6} xl={5}>
          <VisitorCard person={person} />
        </Col>
      ))}
    </Row>
  );
};

export default ResultGrid;
