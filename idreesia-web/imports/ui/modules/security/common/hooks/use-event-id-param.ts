import { useParams } from 'react-router-dom';

export const useEventIdParam = () => {
  const { eventId = '' } = useParams<{ eventId: string }>();
  return eventId;
};
