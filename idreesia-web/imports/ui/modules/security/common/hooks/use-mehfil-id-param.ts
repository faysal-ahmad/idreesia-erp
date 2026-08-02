import { useParams } from 'react-router-dom';

export const useMehfilIdParam = () => {
  const { mehfilId = '' } = useParams<{ mehfilId: string }>();
  return mehfilId;
};
