import { ScreenStub } from '@/components/ScreenStub';
import { greeting } from '@/lib/format';

export default function Worklist() {
  return (
    <ScreenStub
      title={`${greeting()}, Sneha.`}
      milestone={4}
      scope="Overdue, due today, critical, snoozed and done tabs, sorted by risk, with the patient drawer."
    />
  );
}
