import { ScreenStub } from '@/components/ScreenStub';
import { CLINIC } from '@/data/constants';
import { greeting, longDate } from '@/lib/format';

export default function CommandCentre() {
  return (
    <ScreenStub
      title={`${greeting()}, Dr. Mehta`}
      meta={`${longDate()} · ${CLINIC.name}, ${CLINIC.area}`}
      milestone={3}
      scope="Attention strip, journey pipeline, today panel, decisions, cryo summary and team load."
    />
  );
}
