import { ScreenStub } from '@/components/ScreenStub';
import { greeting, longDate } from '@/lib/format';

export default function DoctorsDay() {
  return (
    <ScreenStub
      title={`${greeting()}, Dr. Mehta`}
      meta={`Doctor's Day · ${longDate()}`}
      milestone={7}
      scope="Today's consults with one-line briefs and the AI pre-consultation summary."
    />
  );
}
