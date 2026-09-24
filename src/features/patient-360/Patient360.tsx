import { useParams } from 'react-router-dom';
import { ScreenStub } from '@/components/ScreenStub';

export default function Patient360() {
  const { id } = useParams();
  return (
    <ScreenStub
      title="Patient record"
      meta={id}
      milestone={5}
      scope="Header, personal journey rail with cycle loops, and overview, timeline, cycles, storage, messages, tasks, financial and wellbeing tabs."
    />
  );
}
