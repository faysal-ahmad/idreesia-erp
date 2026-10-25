import React from 'react';
import { Tag } from 'antd';

export const ReviewOptions = [
  { value: 'NOT_REVIEWED', label: 'Not Reviewed' },
  { value: 'CORRECT', label: 'Correct' },
  { value: 'FALSE_POSITIVE', label: 'False Positive' },
];

export const getReviewLabel = (review?: string | null) =>
  ReviewOptions.find(({ value }) => value === (review || 'NOT_REVIEWED'))
    ?.label ?? String(review);

interface Props {
  review?: string | null;
}

const ReviewTag = ({ review }: Props) => {
  if (review === 'CORRECT') return <Tag color="green">Correct</Tag>;
  if (review === 'FALSE_POSITIVE') return <Tag color="orange">False Positive</Tag>;
  return <Tag>Not Reviewed</Tag>;
};

export default ReviewTag;
